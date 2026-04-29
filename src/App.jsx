import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>React App</h1>
        <p>A modern React application powered by Vite</p>
      </header>

      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count: {count}
          </button>
          <p>Edit <code>src/App.jsx</code> and save to see live updates</p>
        </div>

        <div className="features">
          <div className="feature">
            <h3>⚡ Vite</h3>
            <p>Next generation frontend tooling with lightning fast HMR</p>
          </div>
          <div className="feature">
            <h3>⚛️ React 18</h3>
            <p>The latest React with concurrent features and hooks</p>
          </div>
          <div className="feature">
            <h3>🛠️ Ready to Build</h3>
            <p>Start building your app right away</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
