const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateProduct } = require('../validators/product.validator');
const { validateSearch } = require('../validators/product.validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', validateSearch, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', validateSearch, productController.searchProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  protect,
  authorize('ADMIN'),
  upload.array('images', 10),
  productController.parseProductBody,
  validateProduct,
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  authorize('ADMIN'),
  upload.array('images', 10),
  productController.parseProductBody,
  validateProduct,
  productController.updateProduct
);

router.delete('/:id', protect, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
