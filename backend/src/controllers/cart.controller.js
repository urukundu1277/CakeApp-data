const { protect } = require('../middleware/auth.middleware');
const cartService = require('../services/cart.service');

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve cart',
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, flavour, size } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, quantity, flavour, size);
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to add item to cart',
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const cart = await cartService.updateCartItem(req.user._id, itemId, quantity);
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update cart',
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user._id, itemId);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to remove item from cart',
    });
  }
};

const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { items: [], totalAmount: 0 },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to clear cart',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
