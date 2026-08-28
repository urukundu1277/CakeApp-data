const Razorpay = require('razorpay');
const config = require('../config/environment');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { generateOrderNumber } = require('../utils/generateOrderNumber');

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || generateOrderNumber(),
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create payment order');
  }
};

const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const crypto = require('crypto');
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpaySignature) {
    return true;
  }
  return false;
};

const createPayment = async (orderId, userId, razorpayOrderId, amount) => {
  const payment = await Payment.create({
    order: orderId,
    user: userId,
    razorpayOrderId,
    amount,
    currency: 'INR',
    status: 'PENDING',
  });

  return payment;
};

const updatePaymentStatus = async (paymentId, updateData) => {
  const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
    new: true,
    runValidators: true,
  });
  return payment;
};

const getPaymentByOrderId = async (orderId) => {
  return await Payment.findOne({ order: orderId });
};

module.exports = {
  razorpay,
  createRazorpayOrder,
  verifyPayment,
  createPayment,
  updatePaymentStatus,
  getPaymentByOrderId,
};
