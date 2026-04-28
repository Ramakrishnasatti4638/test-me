import { useState, useRef } from 'react'
import './App.css'

function Counter() {
  const [count, setCount] = useState(0)
  const [bump, setBump] = useState(false)

  const trigger = (fn) => {
    fn()
    setBump(true)
    setTimeout(() => setBump(false), 120)
  }

  return (
    <div className="card counter">
      <div className={`counter-display${bump ? ' bump' : ''}`}>{count}</div>
      <div className="counter-controls">
        <button className="btn btn-secondary btn-icon" onClick={() => trigger(() => setCount(c => c - 1))}>−</button>
        <button className="btn btn-primary" onClick={() => trigger(() => setCount(c => c + 1))}>Increment</button>
        <button className="btn btn-ghost" onClick={() => trigger(() => setCount(0))}>Reset</button>
      </div>
    </div>
  )
}

let nextId = 1

function TodoList() {
  const [todos, setTodos] = useState([
    { id: nextId++, text: 'Build something awesome', done: false },
    { id: nextId++, text: 'Ship it 🚀', done: false },
  ])
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos(t => [...t, { id: nextId++, text, done: false }])
    setInput('')
    inputRef.current?.focus()
  }

  const toggle = (id) =>
    setTodos(t => t.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))

  const remove = (id) =>
    setTodos(t => t.filter(todo => todo.id !== id))

  return (
    <div className="card todo-section">
      <h2>To-Do List</h2>
      <div className="todo-form">
        <input
          ref={inputRef}
          className="todo-input"
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      {todos.length === 0
        ? <p className="todo-empty">No tasks yet. Add one above!</p>
        : (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className={`todo-item${todo.done ? ' done' : ''}`}>
                <input
                  type="checkbox"
                  className="todo-check"
                  checked={todo.done}
                  onChange={() => toggle(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
                <button className="todo-delete" onClick={() => remove(todo.id)} aria-label="Delete task">✕</button>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  )
}

export default function App() {
  return (
    <main className="app">
      <header className="header">
        <div className="logo">⚛️</div>
        <h1>React App</h1>
        <p>Built with React + Vite · Edit <code>src/App.jsx</code> to get started</p>
      </header>

      <Counter />
      <TodoList />

      <footer className="footer">
        Made with React &amp; ❤️ &nbsp;·&nbsp;{' '}
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite</a>
        {' '}+{' '}
        <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
      </footer>
    </main>
  )
}
