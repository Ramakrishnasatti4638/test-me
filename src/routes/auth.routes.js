'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');

const auth = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/error');
const { loginValidator, registerValidator } = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Stricter rate-limit on auth endpoints to slow down brute-force / credential-stuffing.
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
  },
});

router.post('/register', authLimiter, registerValidator, validate,
  asyncHandler(auth.register));

router.post('/login', authLimiter, loginValidator, validate,
  asyncHandler(auth.login));

router.post('/logout', auth.logout);

router.get('/me', requireAuth, asyncHandler(auth.me));

module.exports = router;