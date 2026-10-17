import React, { useState, useEffect, useRef } from 'react';
import './TodoItem.css';

function TodoItem({
  todo,
  isEditing,
  onToggle,
  onDelete,
  onEdit,
  onEditStart,
  onEditCancel,
}) {
  const [editText, setEditText] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editText.trim() === '') {
      onEditCancel();
      return;
    }
    if (editText !== todo.title) {
      onEdit(editText.trim());
    } else {
      onEditCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={onToggle}
        aria-label={`Toggle ${todo.title}`}
      />

      {isEditing ? (
        <div className="todo-edit-container">
          <input
            ref={inputRef}
            type="text"
            className="todo-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
          />
        </div>
      ) : (
        <span
          className="todo-text"
          onDoubleClick={onEditStart}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      <button
        className="todo-delete"
        onClick={onDelete}
        aria-label={`Delete ${todo.title}`}
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}

export default TodoItem;
