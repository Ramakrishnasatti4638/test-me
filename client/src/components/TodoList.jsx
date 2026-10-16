import TodoItem from './TodoItem'
import './TodoList.css'

export default function TodoList({ todos, onToggle, onDelete }) {
  const completedCount = todos.filter(t => t.completed).length

  return (
    <div className="todo-list-container">
      <div className="todo-stats">
        <p>{todos.length} total • {completedCount} completed</p>
      </div>
      {todos.length === 0 ? (
        <p className="no-todos">No todos yet. Add one to get started!</p>
      ) : (
        <ul className="todo-list">
          {todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
