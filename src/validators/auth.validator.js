'use strict';

const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 1 }).withMessage('Password is required.'),
];

const registerValidator = [
  ...loginValidator.slice(0, 1), // email
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .isLength({ max: 200 }).withMessage('Password is too long.'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters.'),
];

module.exports = { loginValidator, registerValidator };