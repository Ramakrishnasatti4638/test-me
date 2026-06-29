const http = require('http');
const fs   = require('fs');
const path = require('path');

const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  fs.readFile(HTML_FILE, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Internal server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(8000, () => console.log('Frontend listening on http://localhost:8000'));
