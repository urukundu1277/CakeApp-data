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
    .populate('user', '_id name email mobile customerId')
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
    .populate('user', '_id name email mobile customerId')
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

const cancelOrder = async (orderId, cancellationReason) => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: 'CANCELLED',
      cancellationReason: cancellationReason || 'Cancelled by shop owner',
      cancelledBy: 'ADMIN',
      cancelledAt: new Date(),
    },
    { new: true, runValidators: true }
  );
  return order;
};

const deleteOrder = async (orderId) => {
  const order = await Order.findByIdAndDelete(orderId);
  return order;
};

const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalOrders = await Order.countDocuments();
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
  const pendingOrders = await Order.countDocuments({ orderStatus: 'PLACED' });
  const completedOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
  const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });

  const revenueResult = await Order.aggregate([
    { $match: { orderStatus: 'DELIVERED' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  const recentOrders = await Order.find()
    .populate('user', 'name email mobile')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    recentOrders,
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getDashboardStats,
};
