// ==========================================
// routes/braintree.js - Payment Processing Routes
// ==========================================
// Connects the frontend to Braintree (a PayPal service) to process credit card payments.

const express = require('express');
const router = express.Router();

const { requireSignin, isAuth } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { generateToken, processPayment } = require('../controllers/braintree');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   GET /api/braintree/getToken/:userId
 * @desc    Generates a client token required to initialize the Braintree Drop-in UI on the frontend
 * @access  Private (User must be logged in)
 */
router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken);

/**
 * @route   POST /api/braintree/payment/:userId
 * @desc    Receives the payment method nonce from the frontend and charges the user's card
 * @access  Private (User must be logged in)
 */
router.post(
  '/braintree/payment/:userId',
  requireSignin,
  isAuth,
  processPayment
);

// Intercept :userId to fetch user details and attach to req.profile
router.param('userId', userById);

module.exports = router;
