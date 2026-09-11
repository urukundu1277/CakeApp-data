const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/admin.order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateStatusUpdate } = require('../controllers/admin.order.controller');

router.get('/stats', protect, authorize('ADMIN'), adminOrderController.getDashboardStats);
router.get('/', protect, authorize('ADMIN'), adminOrderController.getAllOrders);
router.get('/:id', protect, authorize('ADMIN'), adminOrderController.getOrderById);
router.put('/:id/status', protect, authorize('ADMIN'), validateStatusUpdate, adminOrderController.updateOrderStatus);
router.put('/:id/cancel', protect, authorize('ADMIN'), adminOrderController.cancelOrder);
router.delete('/:id', protect, authorize('ADMIN'), adminOrderController.deleteOrder);

module.exports = router;
