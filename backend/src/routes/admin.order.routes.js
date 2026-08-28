const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin.order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateStatusUpdate } = require('../controllers/admin.order.controller');

router.get('/', protect, authorize('ADMIN'), adminOrderController.getAllOrders);
router.get('/:id', protect, authorize('ADMIN'), adminOrderController.getOrderById);
router.put('/:id/status', protect, authorize('ADMIN'), validateStatusUpdate, adminOrderController.updateOrderStatus);

module.exports = router;
