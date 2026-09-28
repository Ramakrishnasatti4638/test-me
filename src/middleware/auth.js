'use strict';

const { verify } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Reads the access token from either:
 *   - Authorization: Bearer <token>  (preferred for SPAs / mobile)
 *   - access_token cookie             (fallback for same-site browser flows)
 *
 * On success, attaches `{ id, email }` to `req.user`.
 */
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const cookieToken = req.cookies?.access_token || null;
  const token = bearer || cookieToken;

  if (!token) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHENTICATED'));
  }

  const payload = verify(token);
  if (!payload || payload.typ === 'refresh') {
    return next(new AppError('Invalid or expired token.', 401, 'INVALID_TOKEN'));
  }

  req.user = { id: payload.sub, email: payload.email };
  next();
};

module.exports = { requireAuth };