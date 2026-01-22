# Pharmacy Management System

A pharmacy management system with user registration, login, and medicine ordering.

## Features

- User registration and login
- Medicine catalog with pricing
- Order placement and tracking
- Admin panel for managing medicines
- Location-based services

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Usage

- Visit `http://localhost:3000` to access the application
- Register a new account or log in with existing credentials
- Browse medicines and place orders
- Admin users can manage the medicine catalog from the admin panel

## Deployment

This application is designed to run on Render. The `render.yaml` file contains the deployment configuration.

## Security Note

The data directory containing user information is excluded from the repository for security reasons. When deployed, the application will create this directory dynamically.