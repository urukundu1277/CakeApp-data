const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    required: [true, 'Slider image is required'],
  },
  link: {
    type: String,
    trim: true,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

sliderSchema.index({ sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Slider', sliderSchema);
