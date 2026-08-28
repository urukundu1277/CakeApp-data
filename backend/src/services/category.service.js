const Category = require('../models/Category');

const getAllCategories = async (includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true };
  return await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });
};

const getCategoryById = async (id) => {
  return await Category.findById(id);
};

const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};

const updateCategory = async (id, updateData) => {
  const category = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  return category;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
