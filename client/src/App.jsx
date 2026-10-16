import { useState, useEffect } from 'react'
import './App.css'
import TodoList from './components/TodoList'
import TodoInput from './components/TodoInput'

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (text) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (response.ok) {
        const newTodo = await response.json()
        setTodos([...todos, newTodo])
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map(t => t.id === id ? updatedTodo : t))
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      setTodos(todos.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return (
    <div className="container">
      <h1>📝 My Todo App</h1>
      <TodoInput onAdd={addTodo} />
      {loading ? (
        <p className="loading">Loading todos...</p>
      ) : (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      )}
    </div>
  )
}

export default App
