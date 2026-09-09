const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/slider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', sliderController.getSliders);
router.get('/admin', protect, authorize('ADMIN'), sliderController.getAllSlidersAdmin);
router.get('/:id', sliderController.getSliderById);
router.post('/', protect, authorize('ADMIN'), upload.single('image'), sliderController.createSlider);
router.put('/:id', protect, authorize('ADMIN'), upload.single('image'), sliderController.updateSlider);
router.delete('/:id', protect, authorize('ADMIN'), sliderController.deleteSlider);

module.exports = router;
