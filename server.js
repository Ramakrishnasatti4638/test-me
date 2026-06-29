const http = require('http');

const messages = [
  { id: 1, author: 'Alice', text: 'Hey everyone, welcome to the app!' },
  { id: 2, author: 'Bob',   text: 'Thanks Alice, glad to be here.' },
  { id: 3, author: 'Carol', text: 'This is built with plain Node.js — no frameworks!' },
  { id: 4, author: 'Dave',  text: 'Looking great so far. 🚀' },
];

const server = http.createServer((req, res) => {
  // CORS headers so the frontend (port 8000) can call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/messages') {
    const body = JSON.stringify(messages);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(body);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
