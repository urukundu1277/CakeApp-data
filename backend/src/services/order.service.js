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

const cancelOrder = async (orderId, userId) => {
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
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
};
