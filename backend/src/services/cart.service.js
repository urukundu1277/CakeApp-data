const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images basePrice');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }
  return cart;
};

const addToCart = async (userId, productId, quantity = 1, size) => {
  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) {
    const error = new Error('Product not found or unavailable');
    error.statusCode = 404;
    throw error;
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      size,
      price: product.basePrice,
    });
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();

  return await cart.populate('items.product', 'name images basePrice');
};

const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();

  return await cart.populate('items.product', 'name images basePrice');
};

const removeFromCart = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();

  return await cart.populate('items.product', 'name images basePrice');
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
