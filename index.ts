#!/usr/bin/env node
import { AssetCode, Function, Runtime } from "@aws-cdk/aws-lambda"
import { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage } from "@aws-cdk/aws-apigatewayv2"
import { App, ConcreteDependable, Construct, Duration, RemovalPolicy, Stack, StackProps } from "@aws-cdk/core"
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam"
import { AttributeType, Table, BillingMode } from "@aws-cdk/aws-dynamodb"

import config from "./config.json"

class ChatAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    const tableName = "simplechat_connections"

    // initialise api
    const name = id + "-api"
    const api = new CfnApi(this, name, {
      name: "ChatAppApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.action",
    })
    const table = new Table(this, `${name}-table`, {
      tableName: tableName,
      partitionKey: {
        name: "connectionId",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // initialise lambda and permissions

    const lambdaPolicy = new PolicyStatement({
      actions: [
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:DescribeTable",
        "dynamodb:ConditionCheckItem",
      ],
      resources: [table.tableArn],
    })

    const connectLambdaRole = new Role(this, "connectLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    })
    connectLambdaRole.addToPolicy(lambdaPolicy)
    connectLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
    )

    const disconnectLambdaRole = new Role(this, "disconnectLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    })
    disconnectLambdaRole.addToPolicy(lambdaPolicy)
    disconnectLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
    )

    const messageLambdaRole = new Role(this, "messageLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    })
    messageLambdaRole.addToPolicy(lambdaPolicy)
    messageLambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
    )

    const connectFunc = new Function(this, "connect-lambda", {
      code: new AssetCode("./onconnect"),
      handler: "app.handler",
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
      role: connectLambdaRole,
      environment: {
        TABLE_NAME: tableName,
      },
    })

    const disconnectFunc = new Function(this, "disconnect-lambda", {
      code: new AssetCode("./ondisconnect"),
      handler: "app.handler",
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
      role: disconnectLambdaRole,
      environment: {
        TABLE_NAME: tableName,
      },
    })

    const messageFunc = new Function(this, "message-lambda", {
      code: new AssetCode("./sendmessage"),
      handler: "app.handler",
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
      role: messageLambdaRole,
      initialPolicy: [
        new PolicyStatement({
          actions: ["execute-api:ManageConnections"],
          resources: ["arn:aws:execute-api:" + config["region"] + ":" + config["account_id"] + ":" + api.ref + "/*"],
          effect: Effect.ALLOW,
        }),
      ],
      environment: {
        TABLE_NAME: tableName,
      },
    })

    // access role for the socket api to access the socket lambda
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: [connectFunc.functionArn, disconnectFunc.functionArn, messageFunc.functionArn],
      actions: ["lambda:InvokeFunction"],
    })

    const role = new Role(this, `${name}-iam-role`, {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    })
    role.addToPolicy(policy)

    // lambda integration
    const connectIntegration = new CfnIntegration(this, "connect-lambda-integration", {
      apiId: api.ref,
      integrationType: "AWS_PROXY",
      integrationUri:
        "arn:aws:apigateway:" +
        config["region"] +
        ":lambda:path/2015-03-31/functions/" +
        connectFunc.functionArn +
        "/invocations",
      credentialsArn: role.roleArn,
    })
    const disconnectIntegration = new CfnIntegration(this, "disconnect-lambda-integration", {
      apiId: api.ref,
      integrationType: "AWS_PROXY",
      integrationUri:
        "arn:aws:apigateway:" +
        config["region"] +
        ":lambda:path/2015-03-31/functions/" +
        disconnectFunc.functionArn +
        "/invocations",
      credentialsArn: role.roleArn,
    })
    const messageIntegration = new CfnIntegration(this, "message-lambda-integration", {
      apiId: api.ref,
      integrationType: "AWS_PROXY",
      integrationUri:
        "arn:aws:apigateway:" +
        config["region"] +
        ":lambda:path/2015-03-31/functions/" +
        messageFunc.functionArn +
        "/invocations",
      credentialsArn: role.roleArn,
    })

    const connectRoute = new CfnRoute(this, "connect-route", {
      apiId: api.ref,
      routeKey: "$connect",
      authorizationType: "NONE",
      target: "integrations/" + connectIntegration.ref,
    })

    const disconnectRoute = new CfnRoute(this, "disconnect-route", {
      apiId: api.ref,
      routeKey: "$disconnect",
      authorizationType: "NONE",
      target: "integrations/" + disconnectIntegration.ref,
    })

    const messageRoute = new CfnRoute(this, "message-route", {
      apiId: api.ref,
      routeKey: "sendmessage",
      authorizationType: "NONE",
      target: "integrations/" + messageIntegration.ref,
    })

    const deployment = new CfnDeployment(this, `${name}-deployment`, {
      apiId: api.ref,
    })

    new CfnStage(this, `${name}-stage`, {
      apiId: api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: "dev",
    })

    const dependencies = new ConcreteDependable()
    dependencies.add(connectRoute)
    dependencies.add(disconnectRoute)
    dependencies.add(messageRoute)
    deployment.node.addDependency(dependencies)
  }
}
const app = new App()
new ChatAppStack(app, `chat-app`)
app.synth()
