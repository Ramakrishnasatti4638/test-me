'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');

const signAccess = (payload) =>
  jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'login-backend',
  });

const signRefresh = (payload) =>
  jwt.sign({ ...payload, typ: 'refresh' }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'login-backend',
  });

const verify = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, { issuer: 'login-backend' });
  } catch (err) {
    return null;
  }
};

module.exports = { signAccess, signRefresh, verify };