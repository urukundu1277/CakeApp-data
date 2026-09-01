const { body, param } = require('express-validator');
const paymentService = require('../services/payment.service');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth.middleware');
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

const createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findOne({
      $or: [
        { _id: orderId, user: req.user._id },
        { orderNumber: orderId, user: req.user._id },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order',
      });
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(amount, 'INR', order.orderNumber);

    await paymentService.createPayment(orderId, req.user._id, razorpayOrder.id, amount);

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const isValid = await paymentService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    const order = await Order.findOne({
      $or: [
        { _id: orderId, user: req.user._id },
        { orderNumber: orderId, user: req.user._id },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const payment = await paymentService.getPaymentByOrderId(order._id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    await paymentService.updatePaymentStatus(payment._id, {
      razorpayPaymentId,
      razorpaySignature,
      status: 'PAID',
    });

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order._id,
        paymentId: payment._id,
        status: 'PAID',
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
  createPaymentOrder,
  verifyPayment,
};
