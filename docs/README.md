# Cake Sale App Documentation

## Architecture Overview

This is a three-tier application:

1. **Mobile App (Flutter)** - Customer-facing Android application
2. **Backend API (Node.js/Express)** - REST API server
3. **Admin Panel (React/Vite)** - Web-based administration dashboard

## API Design

All API endpoints are prefixed with `/api/v1`.

### Authentication
- `POST /auth/register` - Customer registration
- `POST /auth/login` - Customer/Admin login
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Request password reset
- `GET /auth/me` - Get current user profile

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `GET /products/featured` - Get featured products
- `GET /products/search` - Search products

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get customer orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/cancel` - Cancel order

### Payments
- `POST /payments/create-order` - Create Razorpay order
- `POST /payments/verify` - Verify payment signature

## Database Schema

See main README.md for detailed schema documentation.

## Deployment

### Backend
Deploy to AWS EC2, AWS ECS, or any Node.js hosting service.

### Admin Panel
Build with `npm run build` and deploy to Cloudflare Pages, Vercel, or Netlify.

### Mobile App
Build release AAB with `flutter build appbundle --release`.
