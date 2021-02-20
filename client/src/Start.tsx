import React from "react"
import "./App.css"

function Start() {
  return (
    <main>
      <h1>Let's play a quiz right now!</h1>

      <div className="box-with-side-image">
        <img className="side-image" src="/images/contestant.png" alt="" height="300px" width="290px" />
        <div className="container">
          <h2>Join a quiz</h2>
          <div className="form-group-col">
            <label htmlFor="contestant-name">Your Name</label>
            <input id="contestant-name" />
          </div>
          <div className="form-group-col">
            <label htmlFor="code">Quiz code</label>
            <input id="code" />
          </div>

          <div className="form-group-col">
            <button>Join the quiz</button>
          </div>
        </div>
      </div>

      <div className="box-with-side-image">
        <img className="side-image" src="/images/hosts.jpeg" alt="" height="300px" width="290px" />
        <div className="container">
          <h2>Host a quiz</h2>
          <div className="form-group-col">
            <label htmlFor="name">Your Name</label>
            <input id="name" />
          </div>

          <div className="form-group-col">
            <button>Host your own quiz</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Start
