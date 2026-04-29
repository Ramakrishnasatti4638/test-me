import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⚛️</div>
        <h1>React App</h1>
        <p className="subtitle">Built with React 18 + Vite</p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Hello, World!</h2>
          <p>Your React app is up and running. Start editing <code>src/App.jsx</code> to build something awesome.</p>
        </div>

        <div className="card counter-card">
          <h2>Counter</h2>
          <p className="count-display">{count}</p>
          <div className="button-group">
            <button className="btn btn-secondary" onClick={() => setCount(c => c - 1)}>−</button>
            <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>+</button>
            <button className="btn btn-ghost" onClick={() => setCount(0)}>Reset</button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Edit, save, and the app will hot-reload automatically.</p>
      </footer>
    </div>
  );
}

export default App;
