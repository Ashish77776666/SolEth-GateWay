// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="http://localhost:2000/" >
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="http://localhost:1000/" >
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>SolEth Gateway</h1>
      {/* <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div> */}
      <p className="read-the-docs">
        Click on the Solana and Ethereum logos to connect
      </p>
    </>
  )
}

export default App
