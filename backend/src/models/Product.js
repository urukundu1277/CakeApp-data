const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: [{
    type: String,
    required: true,
  }],
  flavours: [{
    type: String,
    trim: true,
  }],
  sizes: [{
    type: String,
    trim: true,
  }],
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function (value) {
        return value === undefined || value < this.basePrice;
      },
      message: 'Discount price must be less than base price',
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  preparationTime: {
    type: String,
    default: '24 hours',
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  eggless: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
