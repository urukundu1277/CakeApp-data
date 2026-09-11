const Product = require('../models/Product');
const Category = require('../models/Category');

const getAllProducts = async (filters = {}) => {
  const {
    category,
    categoryId,
    featured,
    available,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const query = {};

  if (categoryId) {
    query.category = categoryId;
  } else if (category && category !== 'all') {
    const categoryDoc = await Category.findOne({ name: { $regex: new RegExp(category, 'i') } });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
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

const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return await product.populate('category', 'name');
};

const updateProduct = async (id, productData) => {
  const product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
  });
  if (!product) {
    throw new Error('Product not found');
  }
  return await product.populate('category', 'name');
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
