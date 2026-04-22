// ==========================================
// routes/user.js - User Profile API Routes
// ==========================================
// This file handles operations related to user profiles, such as viewing, updating,
// and getting purchase history. It heavily relies on authentication middleware.

const express = require('express');
const router = express.Router();

// Import authentication and authorization middleware
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

// Import user controller functions
const {
  users, // List all users
  userById, // Find user by ID and attach to request
  read, // Read a specific user profile
  update, // Update a specific user profile
  purchaseHistory, // Get user's order history
} = require('../controllers/user');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   GET /api/secret/:userId
 * @desc    A test route to verify that a user is an admin
 * @access  Private, Admin Only
 * @flow    1. requireSignin (validates JWT) -> 2. isAuth (ensures logged-in user matches :userId) -> 3. isAdmin (checks role === 1)
 */
router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile, // req.profile is populated by the `userById` param middleware
  });
});

/**
 * @route   GET /api/user/:userId
 * @desc    Get a user's profile information
 * @access  Private (User can only read their own profile)
 */
router.get('/user/:userId', requireSignin, isAuth, read);

/**
 * @route   PUT /api/user/:userId
 * @desc    Update a user's profile information
 * @access  Private (User can only update their own profile)
 */
router.put('/user/:userId', requireSignin, isAuth, update);

/**
 * @route   GET /api/orders/by/user/:userId
 * @desc    Get the purchase history of a user
 * @access  Private (User can only view their own history)
 */
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);

/**
 * @route   GET /api/users
 * @desc    Get a list of all users
 * @access  Public (Should ideally be restricted to Admin in a real-world scenario)
 */
router.get('/users', users);

// ==========================================
// Route Parameters Middleware
// ==========================================
// Anytime the route contains the parameter ':userId', the app will execute `userById` first.
// `userById` fetches the user from the database and appends it to `req.profile`.
router.param('userId', userById);

module.exports = router;
