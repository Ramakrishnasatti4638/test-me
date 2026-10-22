class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.loadTodos();
        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearBtn = document.getElementById('clearBtn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        clearBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.todos.push(todo);
        input.value = '';
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
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

    getRemainingCount() {
        return this.todos.filter(todo => !todo.completed).length;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        this.todos = saved ? JSON.parse(saved) : [];
    }

    render() {
        const todoList = document.getElementById('todoList');
        const taskCount = document.getElementById('taskCount');
        const filtered = this.getFilteredTodos();

        todoList.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMessage = this.currentFilter === 'all' 
                ? 'No tasks yet. Add one to get started!'
                : `No ${this.currentFilter} tasks.`;
            todoList.innerHTML = `<div class="empty-state"><p>${emptyMessage}</p></div>`;
        } else {
            filtered.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-id="${todo.id}"
                    >
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <button class="todo-delete" data-id="${todo.id}">Delete</button>
                `;

                const checkbox = li.querySelector('.todo-checkbox');
                checkbox.addEventListener('change', () => this.toggleTodo(todo.id));

                const deleteBtn = li.querySelector('.todo-delete');
                deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

                todoList.appendChild(li);
            });
        }

        const remaining = this.getRemainingCount();
        const taskWord = remaining === 1 ? 'task' : 'tasks';
        taskCount.textContent = `${remaining} ${taskWord} remaining`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
