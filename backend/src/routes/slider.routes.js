const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/slider.controller');

// Public routes
router.get('/', sliderController.getSliders);
router.get('/:id', sliderController.getSliderById);

// Admin routes
router.post('/', sliderController.createSlider);
router.put('/:id', sliderController.updateSlider);
router.delete('/:id', sliderController.deleteSlider);

module.exports = router;
