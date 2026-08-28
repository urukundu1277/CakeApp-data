const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

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

const validateCreateOrder = [
  body('orderId')
    .notEmpty().withMessage('Order ID is required'),
  body('amount')
    .isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  validateRequest,
];

const validateVerifyPayment = [
  body('razorpayOrderId')
    .notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId')
    .notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature')
    .notEmpty().withMessage('Razorpay signature is required'),
  validateRequest,
];

module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
};
