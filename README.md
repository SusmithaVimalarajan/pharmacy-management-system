# Pharmacy Management System

## Project Description

Pharmacy Management System is a web-based system developed to manage medicines, categories, suppliers, stock, expiry monitoring, users and sales through a centralized system.

## Problem Statement

Traditional pharmacy management can involve manual handling of medicines, stock, suppliers, sales and expiry information. This project provides a computerized system to improve the management of these activities and make pharmacy operations more organized and efficient.

## Project Objectives

- To manage medicines efficiently.
- To manage medicine categories.
- To manage supplier information.
- To manage pharmacy stock.
- To monitor medicine expiry dates.
- To manage pharmacy users.
- To manage medicine sales.
- To provide secure user authentication.
- To provide a centralized dashboard for pharmacy management.

## Main Features

### Admin / Management

- User Login
- User Management
- Medicine Management
- Category Management
- Supplier Management
- Stock Management
- Expiry Monitoring
- Sales Management
- Dashboard

### Pharmacist

- Pharmacist Login
- View Medicines
- Search Medicines
- Check Stock
- Monitor Expiry Dates
- Process Sales

### Staff

- Staff Login
- View Medicine Information
- Search Medicines
- Check Stock
- Assist with Sales Management

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt
- Visual Studio Code
- Git
- GitHub

## Project Scope

The system focuses on managing medicines, categories, suppliers, users, stock, expiry dates and sales activities within a pharmacy.

## Database

The project uses MySQL as the database management system.

Database configuration is provided through environment variables.

## Authentication

The system uses JWT-based authentication to protect API endpoints.

Passwords are securely handled using bcrypt hashing.

## Project Structure

- `config/` - Database configuration
- `middleware/` - Authentication and authorization middleware
- `public/` - Frontend HTML, CSS and JavaScript files
- `routes/` - Backend API routes
- `controllers/` - Application controllers
- `server.js` - Main server file
- `package.json` - Node.js project dependencies

## How to Run the Project

### 1. Install Node.js

Install Node.js on your computer.

### 2. Install Project Dependencies

Open the project folder in the terminal and run:

```bash
npm install