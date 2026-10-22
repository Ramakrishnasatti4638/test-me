class TodoApp {
    constructor() {
        this.todos = this.loadFromStorage();
        this.currentFilter = 'all';
        this.editingId = null;

        // DOM elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearBtn = document.getElementById('clearBtn');
        this.todoCount = document.getElementById('todoCount');

        this.init();
    }

    init() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.clearBtn.addEventListener('click', () => this.clearCompleted());

        this.render();
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToStorage();
        this.render();
        this.todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText && newText.trim()) {
            todo.text = newText.trim();
            this.saveToStorage();
            this.render();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToStorage();
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        this.renderTodoList();
        this.updateStats();
    }

    renderTodoList() {
        const filtered = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filtered.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one to get started!</p></div>';
            return;
        }

        filtered.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox"
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" data-id="${todo.id}">Edit</button>
                    <button class="todo-btn delete-btn" data-id="${todo.id}">Delete</button>
                </div>
            `;

            li.querySelector('.checkbox').addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            li.querySelector('.edit-btn').addEventListener('click', () => {
                this.editTodo(todo.id);
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });

            this.todoList.appendChild(li);
        });
    }

    updateStats() {
        const activeTodos = this.todos.filter(todo => !todo.completed);
        const completedCount = this.todos.length - activeTodos.length;

        const taskText = activeTodos.length === 1 ? 'task' : 'tasks';
        this.todoCount.textContent = `${activeTodos.length} ${taskText}`;

        this.clearBtn.style.display = completedCount > 0 ? 'block' : 'none';
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
