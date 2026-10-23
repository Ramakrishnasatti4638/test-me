const { test, describe } = require('node:test');
const assert = require('node:assert');
const { TodoStore } = require('./todo-store.js');

describe('TodoStore', () => {
  test('initializes with empty list or initial items', () => {
    const emptyStore = new TodoStore();
    assert.strictEqual(emptyStore.todos.length, 0);

    const initial = [{ id: '1', text: 'Task 1', completed: false }];
    const store = new TodoStore(initial);
    assert.strictEqual(store.todos.length, 1);
    assert.strictEqual(store.todos[0].text, 'Task 1');
  });

  test('adds a new todo item', () => {
    const store = new TodoStore();
    const item = store.add('Buy groceries');
    assert.ok(item);
    assert.strictEqual(store.todos.length, 1);
    assert.strictEqual(store.todos[0].text, 'Buy groceries');
    assert.strictEqual(store.todos[0].completed, false);
    assert.ok(store.todos[0].id);

    // Empty or whitespace strings should not be added
    const emptyItem = store.add('   ');
    assert.strictEqual(emptyItem, null);
    assert.strictEqual(store.todos.length, 1);
  });

  test('toggles completion status of a todo', () => {
    const store = new TodoStore();
    const item = store.add('Read book');
    assert.strictEqual(item.completed, false);

    store.toggle(item.id);
    assert.strictEqual(item.completed, true);

    store.toggle(item.id);
    assert.strictEqual(item.completed, false);
  });

  test('deletes a todo item', () => {
    const store = new TodoStore();
    const item1 = store.add('Task 1');
    const item2 = store.add('Task 2');
    assert.strictEqual(store.todos.length, 2);

    const deleted = store.delete(item1.id);
    assert.strictEqual(deleted, true);
    assert.strictEqual(store.todos.length, 1);
    assert.strictEqual(store.todos[0].id, item2.id);

    const deleteNonExistent = store.delete('non-existent-id');
    assert.strictEqual(deleteNonExistent, false);
  });

  test('edits a todo text', () => {
    const store = new TodoStore();
    const item = store.add('Old text');

    const updated = store.edit(item.id, 'Updated text');
    assert.ok(updated);
    assert.strictEqual(item.text, 'Updated text');

    // Blank update rejected
    const blank = store.edit(item.id, '   ');
    assert.strictEqual(blank, null);
    assert.strictEqual(item.text, 'Updated text');
  });

  test('filters todos by all, active, completed', () => {
    const store = new TodoStore();
    const t1 = store.add('Task 1');
    const t2 = store.add('Task 2');
    store.toggle(t1.id);

    assert.strictEqual(store.filter('all').length, 2);
    assert.strictEqual(store.filter('active').length, 1);
    assert.strictEqual(store.filter('active')[0].id, t2.id);
    assert.strictEqual(store.filter('completed').length, 1);
    assert.strictEqual(store.filter('completed')[0].id, t1.id);
  });

  test('clears completed todos', () => {
    const store = new TodoStore();
    const t1 = store.add('Task 1');
    const t2 = store.add('Task 2');
    store.toggle(t1.id);

    const cleared = store.clearCompleted();
    assert.strictEqual(cleared, 1);
    assert.strictEqual(store.todos.length, 1);
    assert.strictEqual(store.todos[0].id, t2.id);
  });

  test('computes correct statistics', () => {
    const store = new TodoStore();
    assert.deepStrictEqual(store.getStats(), {
      total: 0,
      active: 0,
      completed: 0,
      percentage: 0
    });

    const t1 = store.add('Task 1');
    const t2 = store.add('Task 2');
    store.toggle(t1.id);

    assert.deepStrictEqual(store.getStats(), {
      total: 2,
      active: 1,
      completed: 1,
      percentage: 50
    });
  });
});
