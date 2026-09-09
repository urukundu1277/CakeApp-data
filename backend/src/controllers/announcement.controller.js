const announcementService = require('../services/announcement.service');

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementService.getAllAnnouncements();
    res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully',
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve announcements',
    });
  }
};

const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await announcementService.getAllAdminAnnouncements();
    res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully',
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve announcements',
    });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body);
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create announcement',
    });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update announcement',
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.deleteAnnouncement(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete announcement',
    });
  }
};

module.exports = {
  getAnnouncements,
  getAllAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
