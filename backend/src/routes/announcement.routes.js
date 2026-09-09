const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', announcementController.getAnnouncements);
router.get('/admin', protect, authorize('ADMIN'), announcementController.getAllAnnouncementsAdmin);
router.post('/', protect, authorize('ADMIN'), announcementController.createAnnouncement);
router.put('/:id', protect, authorize('ADMIN'), announcementController.updateAnnouncement);
router.delete('/:id', protect, authorize('ADMIN'), announcementController.deleteAnnouncement);

module.exports = router;
