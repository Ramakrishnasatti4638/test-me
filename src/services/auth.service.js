'use strict';

const users = require('../models/user.model');
const { signAccess, signRefresh } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * Use a generic message for both "no such user" and "wrong password" so the
 * endpoint can't be used as a user-enumeration oracle.
 */
const GENERIC_AUTH_FAIL = 'Invalid email or password.';

const buildTokens = (user) => ({
  accessToken: signAccess({ sub: user.id, email: user.email }),
  refreshToken: signRefresh({ sub: user.id }),
});

const register = async ({ email, password, name }) => {
  const user = await users.create({ email, password, name });
  return { user, ...buildTokens(user) };
};

const login = async ({ email, password }) => {
  const user = await users.findByEmail(email);
  if (!user) {
    // Same message + same status as the wrong-password branch on purpose.
    throw new AppError(GENERIC_AUTH_FAIL, 401, 'INVALID_CREDENTIALS');
  }

  const ok = await users.verifyPassword(user, password);
  if (!ok) {
    throw new AppError(GENERIC_AUTH_FAIL, 401, 'INVALID_CREDENTIALS');
  }

  return { user: users.sanitize(user), ...buildTokens(user) };
};

const profile = async (userId) => {
  const user = await users.findById(userId);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return users.sanitize(user);
};

module.exports = { register, login, profile };