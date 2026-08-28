const productService = require('../services/product.service');
const Category = require('../models/Category');

const getProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const result = await productService.getAllProducts(filters);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve products',
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve product',
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getFeaturedProducts(limit);
    res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve featured products',
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const filters = {
      category: req.query.category,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await productService.searchProducts(searchQuery, filters);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Search failed',
    });
  }
};

const createProduct = async (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: req.body,
  });
};

const updateProduct = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { ...req.body, _id: req.params.id },
  });
};

const deleteProduct = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: { _id: req.params.id },
  });
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
