'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config');
const authRouter = require('./routes/auth.routes');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.set('trust proxy', 1);
app.use(helmet());

// CORS — only allow the configured client origin to use credentials.
app.use(cors({
  origin: config.clientOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/health', (req, res) => res.json({ ok: true, env: config.nodeEnv }));

app.use('/api/auth', authRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;