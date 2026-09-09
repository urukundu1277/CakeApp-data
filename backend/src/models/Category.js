const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isFlavorCategory: {
    type: Boolean,
    default: false,
    description: 'If true, this category IS a flavor (e.g., Chocolate, Vanilla)',
  },
  requiresFlavorSelection: {
    type: Boolean,
    default: false,
    description: 'If true, products in this category require explicit flavor selection',
  },
  availableFlavors: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
