const sliderService = require('../services/slider.service');
const fs = require('fs');
const path = require('path');

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

const getAllSlidersAdmin = async (req, res) => {
  try {
    const sliders = await sliderService.getAllSliders({});
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

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  try {
    const filename = path.basename(imagePath);
    const fullPath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (e) {
    // ignore file deletion errors
  }
};

const createSlider = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }

    if (!data.image) {
      return res.status(400).json({
        success: false,
        message: 'Slider image is required',
      });
    }

    const slider = await sliderService.createSlider(data);
    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider,
    });
  } catch (error) {
    if (req.file) {
      deleteImageFile(`/uploads/${req.file.filename}`);
    }
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create slider',
    });
  }
};

const updateSlider = async (req, res) => {
  try {
    const data = { ...req.body };
    const oldSlider = await sliderService.getSliderById(req.params.id);

    if (req.file) {
      if (oldSlider && oldSlider.image) {
        deleteImageFile(oldSlider.image);
      }
      data.image = `/uploads/${req.file.filename}`;
    }

    const slider = await sliderService.updateSlider(req.params.id, data);
    if (!slider) {
      if (req.file) {
        deleteImageFile(`/uploads/${req.file.filename}`);
      }
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
    if (req.file) {
      deleteImageFile(`/uploads/${req.file.filename}`);
    }
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update slider',
    });
  }
};

const deleteSlider = async (req, res) => {
  try {
    const slider = await sliderService.getSliderById(req.params.id);
    if (slider && slider.image) {
      deleteImageFile(slider.image);
    }
    const deletedSlider = await sliderService.deleteSlider(req.params.id);
    if (!deletedSlider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Slider deleted successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete slider',
    });
  }
};

module.exports = {
  getSliders,
  getAllSlidersAdmin,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
};
