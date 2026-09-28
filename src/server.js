'use strict';

const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[login-backend] listening on :${config.port} (${config.nodeEnv})`);
});

const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[login-backend] received ${signal}, shutting down...`);
  server.close(() => process.exit(0));
  // Hard exit if it hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('[unhandledRejection]', err);
});
