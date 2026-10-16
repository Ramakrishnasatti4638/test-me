import { useState } from 'react';
import './TodoForm.css';

export default function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title, description);
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-content">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="form-input"
        />
        {isExpanded && (
          <textarea
            placeholder="Add a description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            rows="3"
          />
        )}
      </div>
      {isExpanded && (
        <div className="form-actions">
          <button
            type="button"
            className="form-button cancel"
            onClick={() => {
              setIsExpanded(false);
              setTitle('');
              setDescription('');
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="form-button submit"
            disabled={!title.trim()}
          >
            Add Todo
          </button>
        </div>
      )}
    </form>
  );
}
