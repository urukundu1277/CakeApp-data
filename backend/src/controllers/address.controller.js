const { body, param } = require('express-validator');
const Address = require('../models/Address');
const { protect } = require('../middleware/auth.middleware');
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({
      success: false,
      message: errorMessages[0],
      errors: errors.array(),
    });
  }
  next();
};

const validateAddress = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('mobile')
    .matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('addressLine1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required')
    .isLength({ max: 200 }).withMessage('Address line 1 cannot exceed 200 characters'),
  body('addressLine2')
    .optional()
    .isLength({ max: 200 }).withMessage('Address line 2 cannot exceed 200 characters'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),
  body('pincode')
    .matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
  body('landmark')
    .optional()
    .isLength({ max: 200 }).withMessage('Landmark cannot exceed 200 characters'),
  validateRequest,
];

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Addresses retrieved successfully',
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve addresses',
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const addressData = { ...req.body, user: req.user._id };

    if (addressData.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create(addressData);
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to add address',
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: id } }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update address',
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete address',
    });
  }
};

module.exports = {
  validateAddress,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
