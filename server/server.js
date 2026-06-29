const http = require('http');

const messages = [
  { id: 1, author: 'Alice', text: 'Hello from the backend!' },
  { id: 2, author: 'Bob',   text: 'Node.js APIs are easy to build.' },
  { id: 3, author: 'Carol', text: 'Fetch me from the frontend 👋' },
  { id: 4, author: 'Dave',  text: 'JSON over HTTP — classic.' },
];

const server = http.createServer((req, res) => {
  // Allow the frontend on port 8000 to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/messages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => console.log('API listening on http://localhost:3000'));
