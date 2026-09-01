const sliderService = require('../services/slider.service');

const getSliders = async (req, res) => {
  try {
    const sliders = await sliderService.getAllSliders({ isActive: true });
    res.status(200).json({
      success: true,
      message: 'Sliders retrieved successfully',
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve sliders',
    });
  }
};

const getSliderById = async (req, res) => {
  try {
    const slider = await sliderService.getSliderById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Slider retrieved successfully',
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve slider',
    });
  }
};

const createSlider = async (req, res) => {
  try {
    const slider = await sliderService.createSlider(req.body);
    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create slider',
    });
  }
};

const updateSlider = async (req, res) => {
  try {
    const slider = await sliderService.updateSlider(req.params.id, req.body);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Slider updated successfully',
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update slider',
    });
  }
};

const deleteSlider = async (req, res) => {
  try {
    const slider = await sliderService.deleteSlider(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Slider deleted successfully',
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete slider',
    });
  }
};

module.exports = {
  getSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
};
