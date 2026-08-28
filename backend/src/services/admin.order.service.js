const Order = require('../models/Order');
const User = require('../models/User');

const getAllOrders = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.orderStatus = filters.status;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  if (filters.search) {
    query.orderNumber = { $regex: filters.search, $options: 'i' };
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('user', 'name email mobile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    },
  };
};

const getOrderById = async (orderId) => {
  return await Order.findById(orderId)
    .populate('user', 'name email mobile')
    .populate('items.product', 'name images');
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true, runValidators: true }
  );
  return order;
};

const cancelOrder = async (orderId) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: 'CANCELLED' },
    { new: true, runValidators: true }
  );
  return order;
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
