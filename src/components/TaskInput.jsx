import { useState } from 'react'

export default function TaskInput({ onAdd }) {
  const [value, setValue] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const text = value.trim()
    if (!text) return
    onAdd(text)
    setValue('')
  }

  return (
    <form className="task-input" onSubmit={submit}>
      <input
        type="text"
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="New task"
      />
      <button type="submit">Add</button>
    </form>
  )
}
