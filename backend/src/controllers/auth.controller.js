const authService = require('../services/auth.service');
const { validateRegister, validateLogin, validateForgotPassword } = require('../validators/auth.validator');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

const mobileLogin = async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    if (process.env.NODE_ENV === 'development') {
      const result = await authService.mobileLogin(mobile, name);
      res.status(200).json({
        success: true,
        message: 'Mobile login successful',
        data: result,
      });
      return;
    }

    const result = await authService.mobileLogin(mobile, name);
    res.status(200).json({
      success: true,
      message: 'Mobile login successful',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Mobile login failed',
    });
  }
};

const firebaseLogin = async (req, res) => {
  try {
    const { name, mobile, firebaseToken } = req.body;

    const result = await authService.firebaseLogin({ name, mobile, firebaseToken });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user._id);
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve profile',
    });
  }
};

const forgotPassword = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Password reset functionality will be implemented in future phases',
  });
};

const logout = async (req, res) => {
  try {
    await authService.updateUser(req.user._id, { isActive: false });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
};

module.exports = {
  register,
  login,
  mobileLogin,
  firebaseLogin,
  getMe,
  forgotPassword,
  logout,
};
