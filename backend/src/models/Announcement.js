const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [200, 'Message cannot exceed 200 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

announcementSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
