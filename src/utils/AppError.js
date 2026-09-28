'use strict';

/**
 * Typed application error. Throw these inside services/controllers and the
 * error-handling middleware will turn them into clean JSON responses.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace?.(this, AppError);
  }
}

module.exports = AppError;