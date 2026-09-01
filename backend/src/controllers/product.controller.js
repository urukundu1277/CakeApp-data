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

const parseProductBody = (req, res, next) => {
  try {
    const body = { ...req.body };

    if (body.categories) {
      try {
        body.categories = JSON.parse(body.categories);
      } catch {
        if (typeof body.categories === 'string') {
          body.categories = [body.categories];
        }
      }
    }

    if (body.sizes) {
      try {
        body.sizes = JSON.parse(body.sizes);
      } catch {
        if (typeof body.sizes === 'string') {
          body.sizes = body.sizes.split(',').map(s => s.trim()).filter(s => s);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      body.images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (body.images) {
      try {
        body.images = JSON.parse(body.images);
      } catch {
        if (typeof body.images === 'string') {
          body.images = body.images.split(',').map(s => s.trim()).filter(s => s);
        }
      }
    }

    req.body = body;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid form data',
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  parseProductBody,
};
