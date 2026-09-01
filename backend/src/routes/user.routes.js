const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('ADMIN'), userController.getUsers);
router.get('/:id', protect, authorize('ADMIN'), userController.getUserById);
router.put('/:id', protect, authorize('ADMIN'), userController.updateUser);
router.delete('/:id', protect, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
