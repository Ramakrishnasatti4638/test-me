import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';

const API_URL = 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTodos(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    try {
      const response = await axios.post(API_URL, { title });
      setTodos([response.data, ...todos]);
    } catch (err) {
      setError('Failed to add todo');
      console.error(err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const editTodo = async (id, newTitle) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { title: newTitle });
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      ));
    } catch (err) {
      setError('Failed to edit todo');
      console.error(err);
    }
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>✓ Todo App</h1>
          <p>Stay organized and productive</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <TodoForm onAddTodo={addTodo} />

        <TodoFilter
          filter={filter}
          onFilterChange={setFilter}
          activeCount={activeCount}
          completedCount={completedCount}
        />

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            {todos.length === 0 ? 'No todos yet. Create one to get started!' : 'No todos in this filter.'}
          </div>
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        )}

        <footer className="footer">
          {todos.length > 0 && (
            <p>
              {activeCount} active · {completedCount} completed · {todos.length} total
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;
