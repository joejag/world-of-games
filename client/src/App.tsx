import React from "react"
import "./App.css"
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket"

const client = new W3CWebSocket("wss://ydby4jdkjd.execute-api.eu-west-2.amazonaws.com/dev")

interface ChatMessage {
  message: string
  name: string
}

function App() {
  const [name, setName] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])

  React.useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected")
    }
    client.onmessage = (event: IMessageEvent) => {
      const message: ChatMessage = JSON.parse(event.data.toString())
      console.log(event)
      setMessages([...messages, message])
    }
  }, [messages])

  const sendMessage = () => {
    console.log("sending message")
    const data = JSON.stringify({ message, name })
    // const data = { message, name }
    client.send(JSON.stringify({ action: "sendmessage", data }))
  }

  return (
    <div className="App">
      <input type="text" onChange={(event) => setName(event.target.value)}></input>
      <ul>
        {messages.map((msg, idx) => (
          <p key={idx}>
            {msg.name}: {msg.message}
          </p>
        ))}
      </ul>
      <input type="text" onChange={(event) => setMessage(event.target.value)}></input>
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default App
