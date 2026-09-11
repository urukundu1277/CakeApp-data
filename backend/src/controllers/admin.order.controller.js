const { param, body } = require('express-validator');
const adminOrderService = require('../services/admin.order.service');
const { authorize } = require('../middleware/auth.middleware');
const { validationResult } = require('express-validator');
const { sendPushNotification } = require('../services/notification.service');
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

const validateStatusUpdate = [
  body('orderStatus')
    .isIn(['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .withMessage('Invalid order status'),
  validateRequest,
];

const getAllOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await adminOrderService.getAllOrders(filters);
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve orders',
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await adminOrderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve order',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await adminOrderService.updateOrderStatus(req.params.id, orderStatus);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await sendPushNotification(
        admin._id,
        'Order Status Updated',
        `Order #${order.orderNumber} status changed to ${orderStatus}`,
        'ORDER',
        { orderId: order._id, orderNumber: order.orderNumber, orderStatus }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update order status',
    });
  }
};

const getOrderByIdForAdmin = async (req, res) => {
  try {
    const order = await adminOrderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve order',
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await adminOrderService.cancelOrder(req.params.id, cancellationReason);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await sendPushNotification(
        admin._id,
        'Order Cancelled by Admin',
        `Order #${order.orderNumber} has been cancelled by admin`,
        'ORDER',
        { orderId: order._id, orderNumber: order.orderNumber }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await adminOrderService.deleteOrder(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete order',
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminOrderService.getDashboardStats();
    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve dashboard stats',
    });
  }
};

module.exports = {
  validateRequest,
  validateStatusUpdate,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getDashboardStats,
};
