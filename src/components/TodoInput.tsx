import React, { useState } from 'react';

interface TodoInputProps {
  onAdd: (title: string) => Promise<void>;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(input);
      setInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
