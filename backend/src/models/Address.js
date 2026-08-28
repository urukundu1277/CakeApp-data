const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [200, 'Address line 1 cannot exceed 200 characters'],
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address line 2 cannot exceed 200 characters'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters'],
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [200, 'Landmark cannot exceed 200 characters'],
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

module.exports = mongoose.model('Address', addressSchema);
