// ==========================================
// routes/auth.js - Authentication API Routes
// ==========================================
// This file maps HTTP requests related to authentication to their respective controller functions.

const express = require('express');
const router = express.Router(); // Create a new Express router instance

// Import controller functions that hold the actual business logic
const { signup, signin, signout } = require('../controllers/auth');

// Import validation middleware to check user input before it hits the controller
const { userSignupValidator } = require('../validator');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   POST /api/signup
 * @desc    Register a new user
 * @access  Public
 * @flow    1. User submits data -> 2. userSignupValidator checks data -> 3. signup controller saves user
 */
router.post('/signup', userSignupValidator, signup);

/**
 * @route   POST /api/signin
 * @desc    Authenticate user & get token
 * @access  Public
 * @flow    1. User submits credentials -> 2. signin controller verifies and returns JWT
 */
router.post('/signin', signin);

/**
 * @route   GET /api/signout
 * @desc    Clear user cookie and log out
 * @access  Public
 * @flow    1. User requests signout -> 2. signout controller clears 't' cookie
 */
router.get('/signout', signout);

// Export the router so it can be mounted in server.js
module.exports = router;
