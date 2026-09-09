const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateCategory } = require('../validators/product.validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', protect, authorize('ADMIN'), upload.single('image'), validateCategory, categoryController.createCategory);
router.put('/:id', protect, authorize('ADMIN'), upload.single('image'), validateCategory, categoryController.updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
