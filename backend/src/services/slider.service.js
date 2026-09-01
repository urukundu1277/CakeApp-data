const Slider = require('../models/Slider');

const getAllSliders = async (filters = {}) => {
  const query = {};

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const sliders = await Slider.find(query)
    .sort({ sortOrder: 1, createdAt: -1 });

  return sliders;
};

const getSliderById = async (id) => {
  return await Slider.findById(id);
};

const createSlider = async (sliderData) => {
  return await Slider.create(sliderData);
};

const updateSlider = async (id, sliderData) => {
  return await Slider.findByIdAndUpdate(id, sliderData, { new: true, runValidators: true });
};

const deleteSlider = async (id) => {
  return await Slider.findByIdAndDelete(id);
};

module.exports = {
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
};
