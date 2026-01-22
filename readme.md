# Pharmacy Project Backend

This folder contains the backend server for the Pharmacy Management System.

## Files Structure

- `server.js` - Main Node.js server file
- `data/` - Data storage directory
  - `users.json` - User accounts data
  - `medicines.json` - Medicines inventory data  
  - `orders.json` - Orders data

## How it works

The server runs on port 3000 and provides:
- Static file serving for the frontend
- RESTful API endpoints for user management
- Medicine inventory management
- Order processing system
- Admin panel functionality

## Starting the Server

You can start the server in two ways:

1. **Automatic**: Open `index.html` in the parent directory - it will automatically start the server
2. **Manual**: Run `Server.bat` from the project root directory

## API Endpoints

- `POST /register` - User registration
- `POST /login` - User login
- `GET /medicines` - Get all medicines
- `POST /medicines` - Add new medicine (admin only)
- `PUT /medicines/:id` - Update medicine (admin only)
- `DELETE /medicines/:id` - Delete medicine (admin only)
- `POST /orders` - Place new order
- `GET /orders` - Get all orders
- `PUT /orders/:id/delivery-time` - Set delivery time (admin only)
- `PUT /orders/:id/confirm-delivery` - Confirm delivery (admin only)