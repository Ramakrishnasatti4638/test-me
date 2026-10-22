import React, { useState } from 'react';
import { Todo } from '../App';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(todo.id, todo.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isUpdating}
        className="w-5 h-5 text-indigo-600 rounded cursor-pointer disabled:cursor-not-allowed"
      />
      <span
        className={`flex-1 ${
          todo.completed
            ? 'line-through text-gray-400'
            : 'text-gray-800'
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={handleDelete}
        disabled={isUpdating}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:cursor-not-allowed opacity-60 hover:opacity-100"
      >
        Delete
      </button>
    </div>
  );
}
