const Product = require('../models/Product');
const Category = require('../models/Category');

const getAllProducts = async (filters = {}) => {
  const {
    category,
    featured,
    available,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const query = {};

  if (category) {
    query.category = category;
  }

  if (featured !== undefined) {
    query.featured = featured;
  }

  if (available !== undefined) {
    query.isAvailable = available;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      hasNext: skip + products.length < total,
    },
  };
};

const getProductById = async (id) => {
  return await Product.findById(id).populate('category', 'name');
};

const getFeaturedProducts = async (limit = 10) => {
  return await Product.find({ isAvailable: true, featured: true })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

const searchProducts = async (searchQuery, filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
    ],
    isAvailable: true,
  };

  if (filters.category) {
    query.category = filters.category;
  }

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      hasNext: skip + products.length < total,
    },
  };
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts,
};
