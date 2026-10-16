import React, { useState } from 'react';
import TodoItem from './TodoItem';
import './TodoList.css';

function TodoList({ todos, onToggle, onDelete, onEdit }) {
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id, newTitle) => {
    onEdit(id, newTitle);
    setEditingId(null);
  };

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isEditing={editingId === todo.id}
          onToggle={() => onToggle(todo.id, todo.completed)}
          onDelete={() => onDelete(todo.id)}
          onEdit={(newTitle) => handleEdit(todo.id, newTitle)}
          onEditStart={() => setEditingId(todo.id)}
          onEditCancel={() => setEditingId(null)}
        />
      ))}
    </div>
  );
}

export default TodoList;
