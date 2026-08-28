const express = require('express');
const router = express.Router();
const {
  validateAddress,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getAddresses);
router.post('/', protect, validateAddress, createAddress);
router.put('/:id', protect, validateAddress, updateAddress);
router.delete('/:id', protect, deleteAddress);

module.exports = router;
