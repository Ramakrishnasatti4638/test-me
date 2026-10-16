import { useState } from 'react'
import './TodoInput.css'

export default function TodoInput({ onAdd }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onAdd(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add a new todo..."
        className="todo-input"
        autoFocus
      />
      <button type="submit" className="add-btn">Add</button>
    </form>
  )
}
