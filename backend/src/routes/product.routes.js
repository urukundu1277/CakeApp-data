const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateProduct } = require('../validators/product.validator');
const { validateSearch } = require('../validators/product.validator');

// Public routes
router.get('/', validateSearch, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', validateSearch, productController.searchProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', validateProduct, productController.createProduct);
router.put('/:id', validateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
