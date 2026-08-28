const notificationService = require('../services/notification.service');
const { protect } = require('../middleware/auth.middleware');

const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await notificationService.getNotificationsByUser(req.user._id, page, limit);

    const unreadCount = await notificationService.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      unreadCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalNotifications: result.total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve notifications',
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id, req.user._id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read',
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllNotificationsAsRead(req.user._id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notifications as read',
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get unread count',
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
