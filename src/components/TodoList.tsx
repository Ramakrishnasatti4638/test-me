import React from 'react';
import TodoItem from './TodoItem';
import { Todo } from '../App';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const completedTodos = todos.filter(t => t.completed);
  const activeTodos = todos.filter(t => !t.completed);

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      {activeTodos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Active</h2>
          <div className="space-y-2">
            {activeTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTodos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Completed ({completedTodos.length})
          </h2>
          <div className="space-y-2 opacity-75">
            {completedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
