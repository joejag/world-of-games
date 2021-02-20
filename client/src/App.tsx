import React from "react"
import "./App.css"
import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket"

const client = new W3CWebSocket("wss://ydby4jdkjd.execute-api.eu-west-2.amazonaws.com/dev")

interface ChatMessage {
  message: string
  name: string
}

interface Marker {
  x: number
  y: number
}

function App() {
  const [name, setName] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [marker, setMarker] = React.useState<Marker | null>(null)
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

  function getCursorPosition(event: any) {
    var rect = event.target.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top

    const data = JSON.stringify({ message: `Clicked on ${x} ${y}`, name })
    setMarker({ x: event.clientX, y: event.clientY })
    client.send(JSON.stringify({ action: "sendmessage", data }))
    // handle failure
  }

  return (
    <div className="App">
      <input type="text" onChange={(event) => setName(event.target.value)}></input>
      <img src="/europe.jpg" width="60%" onMouseDown={(e) => getCursorPosition(e)} />
      {marker && (
        <div
          style={{
            position: "absolute",
            top: marker.y + "px",
            left: marker.x + "px",
            width: "10px",
            height: "10px",
            background: "#000000",
          }}
        />
      )}

      <ul>
        {messages.map((msg, idx) => (
          <p key={msg.message}>
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
