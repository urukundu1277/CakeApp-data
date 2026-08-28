# Cake Sale Online App

A production-ready online cake ordering application for a single cake shop.

## Features

- **Customer Mobile App (Flutter)**: Browse cakes, manage cart, place orders, track delivery
- **Backend API (Node.js/Express)**: REST APIs with JWT authentication, MongoDB, Razorpay integration
- **Admin Panel (React/Vite)**: Manage products, categories, orders, customers, and settings

## Tech Stack

### Customer Mobile App
- Flutter & Dart
- Material 3 Design
- Clean modular architecture
- REST API communication
- Secure token storage

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Helmet, CORS, Rate limiting
- AWS S3 for image storage
- Razorpay for payments
- Firebase Cloud Messaging for notifications

### Admin Panel
- React with Vite
- Tailwind CSS
- REST API integration
- JWT authentication

## Project Structure

```
cake-sale-app/
├── mobile-app/          # Flutter customer application
├── backend/             # Node.js Express API server
├── admin-panel/         # React admin dashboard
├── docs/                # Documentation
├── README.md
├── .gitignore
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Flutter >= 3.x
- Dart >= 3.x
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url> cake-sale-app
   cd cake-sale-app
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install admin panel dependencies:
   ```bash
   cd ../admin-panel
   npm install
   ```

4. Install Flutter dependencies:
   ```bash
   cd ../mobile-app
   flutter pub get
   ```

### Environment Setup

Copy `.env.example` files to `.env` in each service directory and configure the required environment variables.

### Running the Application

#### Backend
```bash
cd backend
npm run dev
```

#### Admin Panel
```bash
cd admin-panel
npm run dev
```

#### Mobile App
```bash
cd mobile-app
flutter run
```

## API Documentation

The backend API is versioned under `/api/v1`. See the backend README for detailed endpoint documentation.

## License

Proprietary
