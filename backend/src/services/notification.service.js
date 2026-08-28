const { messaging } = require('../config/firebase');
const Notification = require('../models/Notification');

const sendPushNotification = async (userId, title, message, type = 'SYSTEM', data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      isRead: false,
    });

    const user = await require('../models/User').findById(userId);
    if (!user || !user.fcmToken || !messaging) {
      return notification;
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        type,
        notificationId: notification._id.toString(),
        ...data,
      },
      token: user.fcmToken,
    };

    await messaging.send(payload);
    return notification;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error('Failed to send notification');
  }
};

const sendOrderNotification = async (userId, orderNumber, orderStatus) => {
  const title = 'Order Update';
  const message = `Your order ${orderNumber} has been ${orderStatus.toLowerCase()}`;
  return await sendPushNotification(userId, title, message, 'ORDER', { orderNumber, orderStatus });
};

const sendPaymentNotification = async (userId, orderNumber, amount) => {
  const title = 'Payment Successful';
  const message = `Payment of ₹${amount} received for order ${orderNumber}`;
  return await sendPushNotification(userId, title, message, 'PAYMENT', { orderNumber, amount });
};

const getNotificationsByUser = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Notification.countDocuments({ user: userId });
  return { notifications, total };
};

const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

module.exports = {
  sendPushNotification,
  sendOrderNotification,
  sendPaymentNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
};
