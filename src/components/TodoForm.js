import React, { useState } from 'react';
import './TodoForm.css';

function TodoForm({ onAddTodo }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    onAddTodo(input.trim());
    setInput('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Add a new todo..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <button type="submit" className="todo-submit">Add</button>
    </form>
  );
}

export default TodoForm;
