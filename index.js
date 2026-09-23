const { app, urlStore } = require('./server');

// Entry point — start the HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
