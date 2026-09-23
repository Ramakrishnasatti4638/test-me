const app = require('./server');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
