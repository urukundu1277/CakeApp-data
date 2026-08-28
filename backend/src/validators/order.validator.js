const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const Order = require('../models/Order');

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

const validateOrder = [
  body('addressId')
    .notEmpty().withMessage('Address is required'),
  body('deliveryDate')
    .isISO8601().withMessage('Please provide a valid delivery date'),
  body('deliveryTimeSlot')
    .notEmpty().withMessage('Delivery time slot is required'),
  body('cakeMessage')
    .optional()
    .isLength({ max: 500 }).withMessage('Cake message cannot exceed 500 characters'),
  validateRequest,
];

module.exports = {
  validateOrder,
};
