import React, { useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import TodoInput from './components/TodoInput';
import './index.css';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos from API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/todos');
        if (!response.ok) throw new Error('Failed to fetch todos');
        const data = await response.json();
        setTodos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const addTodo = async (title: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Failed to create todo');
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updated = await response.json();
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
            <p className="text-gray-600">Stay organized and get things done</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-indigo-600">{todos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>

          {/* Input */}
          <TodoInput onAdd={addTodo} />

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-2">Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No todos yet. Add one to get started! 🎉</p>
            </div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
