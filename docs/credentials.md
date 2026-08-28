# Cake Sale App - Credentials Reference

## MongoDB Atlas
- **Username:** cakeapp
- **Password:** cakeapp@123
- **Connection String:** mongodb+srv://cakeapp:cakeapp%40123@cluster0.dupaitg.mongodb.net/cake-sale-app?retryWrites=true&w=majority
- **Database:** cake-sale-app

## Admin Panel
- **URL:** http://localhost:5173
- **Default Admin Email:** admin@cakesale.com
- **Default Admin Password:** admin123
- **Role:** ADMIN

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@cakesale.com",
    "mobile": "9876543210",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

## Backend API
- **Base URL:** http://localhost:5000/api/v1
- **Health Check:** http://localhost:5000/health

## Mobile App (Testing)
- **Platform:** Android
- **API Base URL:** http://localhost:5000/api/v1

## Environment Variables
See `.env.example` files in each service directory for full list.
