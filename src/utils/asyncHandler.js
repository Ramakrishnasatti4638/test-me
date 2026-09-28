'use strict';

/**
 * Wraps an async route handler so thrown errors / rejected promises
 * automatically forward to the Express error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;