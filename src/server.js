import { createApp } from './app.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 3000;
const db = initDb();
const app = createApp(db);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`URL Shortener server running at http://localhost:${PORT}`);
});
