import express from 'express';
import productsRouter from './routes/products.js';

const app = express();
app.use(productsRouter);

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(3000);
}

export default app;