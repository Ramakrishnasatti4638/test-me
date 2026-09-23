const { app, urlStore } = require('./server');

// Start the server only when running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`URL Shortener running on port ${PORT}`);
  });
}
