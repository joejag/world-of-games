import React from "react"
import "./App.css"

function Start() {
  return (
    <main>
      <h1 className="text-center text-dark">Let's play a quiz right now!</h1>

      <div className="flex-row flex-justify mb5">
        <img
          className="border-tl pt3 pr0 pb3 pl3 bg-white"
          src="/images/contestant.png"
          alt=""
          height="300px"
          width="290px"
        />
        <div className="border-rb bg-white pt5 pb5 pr3 pl3">
          <h2 className="m0">Join a quiz</h2>
          <div className="flex-col mb1 ml5 mr5">
            <label htmlFor="contestant-name" className="mt3 mb2">
              Your Name
            </label>
            <input id="contestant-name" className="pr3 pl3 br1 lh5 min-w11 bg-gray-90" />
          </div>
          <div className="flex-col mb1 ml5 mr5">
            <label htmlFor="code" className="mt3 mb2">
              Quiz code
            </label>
            <input id="code" className="pr3 pl3 br1 lh5 min-w11 bg-gray-90" />
          </div>

          <div className="flex-col ml5 mr5">
            <button className="mt4 pt3 pb3 pr4 pl4 br1 text-upper text-white bg-pink b-pink-90">Join the quiz</button>
          </div>
        </div>
      </div>

      <div className="flex-row flex-justify">
        <img
          className="border-tl pt3 pr0 pb3 pl3 bg-white"
          src="/images/hosts.jpeg"
          alt=""
          height="300px"
          width="290px"
        />
        <div className="border-rb bg-white pt5 pb5 pr3 pl3">
          <h2 className="m0">Host a quiz</h2>
          <div className="flex-col mb1 ml5 mr5">
            <label htmlFor="name" className="mt3 mb2">
              Your Name
            </label>
            <input id="name" className="pr3 pl3 br1 lh5 min-w11 bg-gray-90" />
          </div>

          <div className="flex-col ml5 mr5">
            <button className="mt4 pt3 pb3 pr4 pl4 br1 text-upper text-white bg-pink b-pink-90">
              Host your own quiz
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Start
