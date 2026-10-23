class TodoStore {
  constructor(initialTodos = []) {
    this.todos = [...initialTodos];
  }

  add(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;
    const item = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.todos.push(item);
    return item;
  }

  toggle(id) {
    const item = this.todos.find(t => t.id === id);
    if (item) {
      item.completed = !item.completed;
      return item;
    }
    return null;
  }

  delete(id) {
    const prevLen = this.todos.length;
    this.todos = this.todos.filter(t => t.id !== id);
    return this.todos.length < prevLen;
  }

  edit(id, newText) {
    const trimmed = (newText || '').trim();
    if (!trimmed) return null;
    const item = this.todos.find(t => t.id === id);
    if (item) {
      item.text = trimmed;
      return item;
    }
    return null;
  }

  clearCompleted() {
    const removedCount = this.todos.filter(t => t.completed).length;
    this.todos = this.todos.filter(t => !t.completed);
    return removedCount;
  }

  filter(type = 'all') {
    if (type === 'active') return this.todos.filter(t => !t.completed);
    if (type === 'completed') return this.todos.filter(t => t.completed);
    return [...this.todos];
  }

  getStats() {
    const active = this.todos.filter(t => !t.completed).length;
    const completed = this.todos.length - active;
    const percentage = this.todos.length === 0 ? 0 : Math.round((completed / this.todos.length) * 100);
    return {
      total: this.todos.length,
      active,
      completed,
      percentage
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoStore };
}
