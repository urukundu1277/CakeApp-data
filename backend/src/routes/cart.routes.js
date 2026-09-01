const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  validateProductId,
  validateSearch,
} = require('../validators/product.validator');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, validateProductId, cartController.addToCart);
router.put('/items/:itemId', protect, cartController.updateCartItem);
router.delete('/items/:itemId', protect, cartController.removeFromCart);
router.delete('/', protect, cartController.clearCart);

module.exports = router;
