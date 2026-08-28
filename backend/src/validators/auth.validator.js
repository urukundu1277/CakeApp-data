const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages[0],
      errors: errors.array(),
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('mobile')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'ADMIN']).withMessage('Invalid role'),
  validateRequest,
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validateRequest,
];

const validateForgotPassword = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  validateRequest,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
};
