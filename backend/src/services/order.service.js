const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { generateOrderNumber } = require('../utils/generateOrderNumber');

const createOrder = async (orderData) => {
  const order = await Order.create(orderData);
  return order;
};

const getOrdersByUser = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments({ user: userId });
  return { orders, total };
};

const getOrderById = async (orderId, userId) => {
  return await Order.findOne({ _id: orderId, user: userId });
};

const cancelOrder = async (orderId, userId, { cancellationReason, cancelledBy } = {}) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  if (!['PLACED', 'CONFIRMED'].includes(order.orderStatus)) {
    const error = new Error('Order cannot be cancelled at this stage');
    error.statusCode = 400;
    throw error;
  }
  order.orderStatus = 'CANCELLED';
  order.cancellationReason = cancellationReason || null;
  order.cancelledBy = cancelledBy || 'CUSTOMER';
  order.cancelledAt = new Date();
  await order.save();
  return order;
};

const adminCancelOrder = async (orderId, adminId, { cancellationReason } = {}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  if (order.orderStatus === 'CANCELLED') {
    const error = new Error('Order is already cancelled');
    error.statusCode = 400;
    throw error;
  }
  if (order.orderStatus === 'DELIVERED') {
    const error = new Error('Cannot cancel a delivered order');
    error.statusCode = 400;
    throw error;
  }
  order.orderStatus = 'CANCELLED';
  order.cancellationReason = cancellationReason || 'Cancelled by shop owner';
  order.cancelledBy = 'ADMIN';
  order.cancelledAt = new Date();
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
};
