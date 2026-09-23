const { app, urlStore } = require('../server');
const { createServer } = require('http');

// Entry-point for running the server
const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
