import { useState } from 'react'

const initialTasks = [
  { id: 1, text: 'Design new landing page', priority: 'high', done: false },
  { id: 2, text: 'Fix authentication bug', priority: 'high', done: true },
  { id: 3, text: 'Write unit tests for API', priority: 'medium', done: false },
  { id: 4, text: 'Update project documentation', priority: 'low', done: false },
  { id: 5, text: 'Review pull requests', priority: 'medium', done: true },
]

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

export default function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [input, setInput] = useState('')

  const toggle = id =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))

  const remove = id => setTasks(ts => ts.filter(t => t.id !== id))

  const add = e => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setTasks(ts => [...ts, { id: Date.now(), text, priority: 'medium', done: false }])
    setInput('')
  }

  const done = tasks.filter(t => t.done).length

  return (
    <div className="task-section">
      <div className="task-header">
        <h2>Tasks</h2>
        <span className="task-progress">{done}/{tasks.length} completed</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <form className="task-form" onSubmit={add}>
        <input
          className="task-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task…"
        />
        <button className="task-add-btn" type="submit">Add</button>
      </form>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggle(task.id)}
            />
            <span className="task-text">{task.text}</span>
            <span
              className="priority-badge"
              style={{ '--p': priorityColor[task.priority] }}
            >
              {task.priority}
            </span>
            <button className="remove-btn" onClick={() => remove(task.id)} aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
