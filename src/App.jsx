import { useState } from 'react'
import Header from './components/Header'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import Stats from './components/Stats'
import './App.css'

const INITIAL_TASKS = [
  { id: 1, text: 'Learn React fundamentals', done: true },
  { id: 2, text: 'Build a sample project', done: false },
  { id: 3, text: 'Deploy to production', done: false },
]

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [filter, setFilter] = useState('all')

  const addTask = (text) => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text, done: false },
    ])
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done))
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  return (
    <div className="app">
      <Header />
      <main className="container">
        <TaskInput onAdd={addTask} />
        <div className="filter-bar">
          {['all', 'active', 'done'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <TaskList tasks={filtered} onToggle={toggleTask} onDelete={deleteTask} />
        <Stats tasks={tasks} onClearCompleted={clearCompleted} />
      </main>
    </div>
  )
}
