export const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

export const todos = [
  { id: 1, title: 'Buy milk', completed: false, userId: 1 },
  { id: 2, title: 'Read a book', completed: true, userId: 1 },
  { id: 3, title: 'Write code', completed: false, userId: 2 },
];

let nextUserId = users.length + 1;
let nextTodoId = todos.length + 1;

export const getNextUserId = () => nextUserId++;
export const getNextTodoId = () => nextTodoId++;