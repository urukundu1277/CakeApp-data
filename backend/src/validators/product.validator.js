const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');

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

const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  validateRequest,
];

const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('categories')
    .isArray({ min: 1 }).withMessage('At least one category is required'),
  body('basePrice')
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  validateRequest,
];

const validateProductId = [
  body('productId')
    .notEmpty().withMessage('Product ID is required'),
  validateRequest,
];

const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validateRequest,
];

module.exports = {
  validateCategory,
  validateProduct,
  validateProductId,
  validateSearch,
};
