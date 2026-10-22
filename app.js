(function () {
    'use strict';

    const STORAGE_KEY = 'todo-app-items';
    const FILTER_KEY = 'todo-app-filter';

    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const itemsCount = document.getElementById('items-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let todos = loadTodos();
    let currentFilter = loadFilter();

    function loadTodos() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    function loadFilter() {
        const stored = localStorage.getItem(FILTER_KEY);
        return stored && ['all', 'active', 'completed'].includes(stored) ? stored : 'all';
    }

    function saveFilter() {
        localStorage.setItem(FILTER_KEY, currentFilter);
    }

    function addTodo(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        todos.push({
            id: Date.now() + Math.random(),
            text: trimmed,
            completed: false,
        });

        saveTodos();
        render();
    }

    function toggleTodo(id) {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }

    function deleteTodo(id) {
        todos = todos.filter((t) => t.id !== id);
        saveTodos();
        render();
    }

    function clearCompleted() {
        todos = todos.filter((t) => !t.completed);
        saveTodos();
        render();
    }

    function getFilteredTodos() {
        if (currentFilter === 'active') return todos.filter((t) => !t.completed);
        if (currentFilter === 'completed') return todos.filter((t) => t.completed);
        return todos;
    }

    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '\u00d7';
        deleteBtn.setAttribute('aria-label', 'Delete todo');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(deleteBtn);
        return li;
    }

    function updateCount() {
        const activeCount = todos.filter((t) => !t.completed).length;
        itemsCount.textContent = activeCount + (activeCount === 1 ? ' item left' : ' items left');
    }

    function updateClearButton() {
        const hasCompleted = todos.some((t) => t.completed);
        clearCompletedBtn.disabled = !hasCompleted;
    }

    function updateFilterButtons() {
        filterButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === currentFilter);
        });
    }

    function render() {
        todoList.innerHTML = '';
        const filtered = getFilteredTodos();
        filtered.forEach((todo) => todoList.appendChild(createTodoElement(todo)));
        updateCount();
        updateClearButton();
        updateFilterButtons();
    }

    addBtn.addEventListener('click', () => {
        addTodo(todoInput.value);
        todoInput.value = '';
        todoInput.focus();
    });

    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTodo(todoInput.value);
            todoInput.value = '';
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            saveFilter();
            render();
        });
    });

    render();
})();