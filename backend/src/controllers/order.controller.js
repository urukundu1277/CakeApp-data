const { body } = require('express-validator');
const orderService = require('../services/order.service');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const { protect } = require('../middleware/auth.middleware');
const { validationResult } = require('express-validator');
const { sendPushNotification } = require('../services/notification.service');
const User = require('../models/User');
const { generateOrderNumber } = require('../utils/generateOrderNumber');

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

const createOrder = async (req, res) => {
  try {
    const { addressId, deliveryDate, deliveryTimeSlot, cakeMessage } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images category');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const orderNumber = await generateOrderNumber();

    const orderData = {
      orderNumber,
      user: req.user._id,
      items: cart.items.map((item) => {
        const product = item.product;
        const category = product.category ? (typeof product.category === 'object' ? product.category : null) : null;
        return {
          product: product._id,
          name: product.name,
          image: product.images[0] || '',
          categoryId: category ? category._id : null,
          categoryName: category ? category.name : '',
          size: item.size,
          flavor: item.flavor || '',
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      }),
      address: {
        name: address.name,
        mobile: address.mobile,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
      },
      deliveryDate,
      deliveryTimeSlot,
      cakeMessage,
      subtotal: cart.totalAmount,
      deliveryFee: 40,
      discount: 0,
      totalAmount: cart.totalAmount + 40,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
    };

    const order = await orderService.createOrder(orderData);

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await sendPushNotification(
        admin._id,
        'New Order Received',
        `Order #${order.orderNumber} has been placed by ${req.user.name}`,
        'ORDER',
        { orderId: order._id, orderNumber: order.orderNumber }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await orderService.getOrdersByUser(req.user._id, page, limit);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalOrders: result.total,
      },
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
    const order = await orderService.getOrderById(req.params.id, req.user._id);

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
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve order',
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, req.user._id, {
      cancellationReason,
      cancelledBy: 'CUSTOMER',
    });

    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await sendPushNotification(
        admin._id,
        'Order Cancelled',
        `Order #${order.orderNumber} has been cancelled by customer`,
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

const adminCancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await orderService.adminCancelOrder(req.params.id, req.user._id, {
      cancellationReason,
    });

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

module.exports = {
  validateOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
