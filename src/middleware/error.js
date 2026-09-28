'use strict';

const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/** Run after express-validator chains; collapses errors into a single 400. */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return next(new AppError('Validation failed.', 400, 'VALIDATION_ERROR'));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details || undefined },
    });
  }

  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.` },
  });
};

module.exports = { validate, errorHandler, notFound };