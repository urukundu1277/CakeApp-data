const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/environment');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const addressRoutes = require('./routes/address.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminOrderRoutes = require('./routes/admin.order.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [config.cors.origin, config.cors.mobileUrl],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// API root
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cake Sale API v1 is running',
    environment: config.env,
    endpoints: {
      auth: '/api/v1/auth',
      categories: '/api/v1/categories',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      addresses: '/api/v1/addresses',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      adminOrders: '/api/v1/admin/orders',
      notifications: '/api/v1/notifications',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = { app, connectDB };
