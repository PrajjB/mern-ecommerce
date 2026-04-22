// ==========================================
// server.js - Main Application Entry Point
// ==========================================
// This file initializes the Express server, connects to the MongoDB database,
// configures all global middleware (like CORS and Body Parser), and registers
// the API routes for the backend.

// --- External Dependencies ---
const express = require('express');        // Core framework for building the REST API
const mongoose = require('mongoose');      // ODM (Object Data Modeling) library for MongoDB
const morgan = require('morgan');          // HTTP request logger middleware for Node.js
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies (e.g., JSON)
const cookieParser = require('cookie-parser'); // Middleware to parse Cookie header and populate req.cookies
const cors = require('cors');              // Middleware to enable Cross-Origin Resource Sharing (allows frontend to access the API)
const path = require('path');              // Node.js module for working with file and directory paths

// Load environment variables from the .env file into process.env
require('dotenv').config();

// --- Internal Route Imports ---
// These files contain the logic for handling specific API endpoints.
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');

// Initialize the Express application
const app = express();

// ==========================================
// Database Connection Setup
// ==========================================
/**
 * connectDB Function
 * Connects to the MongoDB database using Mongoose.
 * It uses the connection string stored in the MONGODB_URI environment variable.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
  }
};
// Execute the database connection function
connectDB();

// ==========================================
// Middleware Configuration
// ==========================================
// morgan('dev'): Logs API requests to the console in a concise, colored format for debugging.
app.use(morgan('dev'));
// bodyParser.json(): Parses incoming requests with JSON payloads so we can access them via req.body.
app.use(bodyParser.json());
// cookieParser(): Parses cookies attached to the client request object. Essential for handling JWT tokens stored in cookies.
app.use(cookieParser());
// cors(): Enables our backend to accept requests from our frontend (which might be running on a different port like 3000 or 5173).
app.use(cors());

// ==========================================
// Route Registration
// ==========================================
// All API routes are prefixed with '/api'.
// For example, auth routes will be accessible at http://localhost:PORT/api/...
app.use('/api', authRoutes);     // Handles signup, signin, signout
app.use('/api', userRoutes);     // Handles user profile operations (read, update)
app.use('/api', categoryRoutes); // Handles creating, reading, updating, deleting product categories
app.use('/api', productRoutes);  // Handles product management and filtering
app.use('/api', braintreeRoutes); // Handles payment processing via Braintree
app.use('/api', orderRoutes);    // Handles order creation and tracking

// ==========================================
// Production Environment Setup
// ==========================================
// If the application is running in a production environment (e.g., deployed on Heroku/Render)
if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the React frontend build folder
  app.use(express.static('client/build'));

  // For any route that is not part of the '/api' prefix, serve the React index.html file.
  // This allows React Router to handle client-side routing instead of the server throwing a 404.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Define the port the server will listen on. Uses the PORT env variable or defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming connections
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
