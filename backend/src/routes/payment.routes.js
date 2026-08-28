const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateCreateOrder, validateVerifyPayment } = require('../validators/payment.validator');

router.post('/create-order', protect, validateCreateOrder, paymentController.createPaymentOrder);
router.post('/verify', protect, validateVerifyPayment, paymentController.verifyPayment);

module.exports = router;
