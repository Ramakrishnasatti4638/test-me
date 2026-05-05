import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>React App</h1>
        <p>Edit <code>src/App.jsx</code> to get started.</p>
        <div className="card">
          <button onClick={() => setCount((c) => c + 1)}>
            Count: {count}
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
