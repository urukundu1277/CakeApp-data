const Announcement = require('../models/Announcement');

const getAllAnnouncements = async () => {
  return await Announcement.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
};

const getAllAdminAnnouncements = async () => {
  return await Announcement.find().sort({ order: 1, createdAt: -1 });
};

const createAnnouncement = async (data) => {
  return await Announcement.create(data);
};

const updateAnnouncement = async (id, data) => {
  return await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteAnnouncement = async (id) => {
  return await Announcement.findByIdAndDelete(id);
};

module.exports = {
  getAllAnnouncements,
  getAllAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
