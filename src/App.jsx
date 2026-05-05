import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>React App</h1>
        <p>Built with React + Vite</p>
      </header>
      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
          <p>Edit <code>src/App.jsx</code> to get started</p>
        </div>
      </main>
    </div>
  )
}

export default App
