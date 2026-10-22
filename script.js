class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.render();
    }

    cacheElements() {
        this.todoForm = document.getElementById('todoForm');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    attachEventListeners() {
        this.todoForm.addEventListener('submit', (e) => this.addTodo(e));
        this.filterBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e));
        });
    }

    addTodo(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();

        if (!text) return;

        const todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter((todo) => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    setFilter(e) {
        this.currentFilter = e.target.dataset.filter;
        this.filterBtns.forEach((btn) => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter((t) => !t.completed);
            case 'completed':
                return this.todos.filter((t) => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter((t) => t.completed).length;
        const active = total - completed;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    render() {
        const filtered = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filtered.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            filtered.forEach((todo) => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'checkbox';
                checkbox.checked = todo.completed;
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

                const span = document.createElement('span');
                span.className = 'todo-text';
                span.textContent = todo.text;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-delete';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);
                this.todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
