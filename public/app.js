const { useState, useEffect } = React;

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError('Error loading todos. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();

    if (!newTodo.trim()) {
      setError('Please enter a todo title');
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTodo,
          description: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const todo = await response.json();
      setTodos([...todos, todo]);
      setNewTodo('');
    } catch (err) {
      setError('Error adding todo. Please try again.');
      console.error(err);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      setError('');
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !completed })
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updated = await response.json();
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError('Error updating todo. Please try again.');
      console.error(err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError('');
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Error deleting todo. Please try again.');
      console.error(err);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    React.createElement('div', { className: 'app-container' },
      React.createElement('div', { className: 'app-header' },
        React.createElement('h1', null, '✓ Todo App'),
        React.createElement('p', null, 'Stay organized and productive')
      ),
      React.createElement('div', { className: 'app-content' },
        error && React.createElement('div', { className: 'error' }, error),
        React.createElement('form', { onSubmit: addTodo, className: 'input-section' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Add a new task...',
            value: newTodo,
            onChange: (e) => setNewTodo(e.target.value),
            disabled: loading
          }),
          React.createElement('button', { type: 'submit', disabled: loading }, 'Add')
        ),
        loading && React.createElement('div', { className: 'loading' }, 'Loading todos...'),
        !loading && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'stats' },
            React.createElement('div', { className: 'stat-item' },
              React.createElement('span', { className: 'stat-number' }, totalCount),
              React.createElement('span', null, 'Total')
            ),
            React.createElement('div', { className: 'stat-item' },
              React.createElement('span', { className: 'stat-number' }, completedCount),
              React.createElement('span', null, 'Completed')
            ),
            React.createElement('div', { className: 'stat-item' },
              React.createElement('span', { className: 'stat-number' }, totalCount - completedCount),
              React.createElement('span', null, 'Remaining')
            )
          ),
          React.createElement('div', { className: 'todos-list' },
            todos.length === 0
              ? React.createElement('div', { className: 'empty-state' },
                React.createElement('div', { className: 'empty-state-icon' }, '📝'),
                React.createElement('p', null, 'No todos yet. Create one to get started!')
              )
              : todos.map(todo =>
                React.createElement('div',
                  { key: todo.id, className: `todo-item ${todo.completed ? 'completed' : ''}` },
                  React.createElement('input', {
                    type: 'checkbox',
                    className: 'todo-checkbox',
                    checked: todo.completed,
                    onChange: () => toggleTodo(todo.id, todo.completed)
                  }),
                  React.createElement('div', { className: 'todo-content' },
                    React.createElement('div', { className: 'todo-title' }, todo.title),
                    todo.description && React.createElement('div', { className: 'todo-description' }, todo.description),
                    React.createElement('div', { className: 'todo-date' },
                      new Date(todo.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    )
                  ),
                  React.createElement('div', { className: 'todo-actions' },
                    React.createElement('button', {
                      className: 'delete-btn',
                      onClick: () => deleteTodo(todo.id)
                    }, 'Delete')
                  )
                )
              )
          )
        )
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(TodoApp));
