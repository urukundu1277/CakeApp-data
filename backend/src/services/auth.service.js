const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const User = require('../models/User');
const { generateCustomerId } = require('../utils/generateCustomerId');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

const register = async (userData) => {
  const { name, email, mobile, password, role = 'CUSTOMER' } = userData;

  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }],
  });

  if (existingUser) {
    const error = new Error('User already exists with this email or mobile');
    error.statusCode = 400;
    throw error;
  }

  const customerId = await generateCustomerId();

  const user = await User.create({
    name,
    email,
    mobile,
    password,
    role,
    customerId,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      customerId: user.customerId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

const mobileLogin = async (mobile, name) => {
  let user = await User.findOne({ mobile });

  if (!user) {
    const customerId = await generateCustomerId();
    user = await User.create({
      name: name || 'User',
      email: `${mobile}@temp.com`,
      mobile,
      password: Math.random().toString(36),
      role: 'CUSTOMER',
      customerId,
    });
  } else if (name && user.name === 'User') {
    user.name = name;
    await user.save();
  }

  user.isActive = true;
  await user.save();

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      customerId: user.customerId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

const firebaseLogin = async ({ name, mobile, firebaseToken }) => {
  if (!firebaseToken) {
    const error = new Error('Firebase token is required');
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findOne({ mobile });

  if (!user) {
    const customerId = await generateCustomerId();
    user = await User.create({
      name: name || 'User',
      email: `${mobile}@temp.com`,
      mobile,
      password: Math.random().toString(36),
      role: 'CUSTOMER',
      customerId,
    });
  } else if (name && (user.name === 'User' || !user.name)) {
    user.name = name;
  }

  user.isActive = true;
  await user.save();

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      customerId: user.customerId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  register,
  login,
  mobileLogin,
  firebaseLogin,
  getMe,
  updateUser,
};
