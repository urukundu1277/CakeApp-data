const categoryService = require('../services/category.service');
const path = require('path');
const fs = require('fs');
const Category = require('../models/Category');

const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const categories = await categoryService.getAllCategories(includeInactive);
    
    // Get product counts for each category
    const productCounts = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categories',
          as: 'products'
        }
      },
      {
        $project: {
          _id: 1,
          productCount: { $size: '$products' }
        }
      }
    ]);

    const productCountMap = {};
    productCounts.forEach(item => {
      productCountMap[item._id.toString()] = item.productCount;
    });

    const categoriesWithCounts = categories.map(category => ({
      ...category.toObject(),
      productCount: productCountMap[category._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categoriesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve categories',
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve category',
    });
  }
};

const createCategory = async (req, res) => {
  try {
    let categoryData = { ...req.body };
    
    if (req.file) {
      categoryData.image = `/uploads/${req.file.filename}`;
    }
    
    const category = await categoryService.createCategory(categoryData);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    const category = await categoryService.updateCategory(req.params.id, updateData);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
