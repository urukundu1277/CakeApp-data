const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateOrder } = require('../validators/order.validator');

router.post('/', protect, validateOrder, orderController.createOrder);
router.get('/', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
