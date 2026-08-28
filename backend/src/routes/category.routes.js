const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateCategory } = require('../validators/product.validator');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
