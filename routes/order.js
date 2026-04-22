// ==========================================
// routes/order.js - Order Management API Routes
// ==========================================
// Handles the creation and management of user orders, bridging user history and product inventory.

const express = require('express');
const router = express.Router();

// Import necessary middlewares from different controllers
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById, addOrderToUserHistory } = require('../controllers/user');
const { decreaseQuantity } = require('../controllers/product');
const {
  create,
  listOrders,
  getStatusValues,
  orderById,
  updateOrderStatus,
} = require('../controllers/order');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   POST /api/order/create/:userId
 * @desc    Creates a new order after successful payment
 * @access  Private
 * @flow    1. Verify Auth -> 2. Verify User matches :userId -> 
 *          3. addOrderToUserHistory (Updates user profile) -> 
 *          4. decreaseQuantity (Updates product inventory: stock--, sold++) -> 
 *          5. create (Saves Order to DB)
 */
router.post(
  '/order/create/:userId',
  requireSignin,
  isAuth,
  addOrderToUserHistory,
  decreaseQuantity,
  create
);

/**
 * @route   GET /api/order/list/:userId
 * @desc    Fetches all orders placed by all users (for the Admin dashboard)
 * @access  Private, Admin Only
 */
router.get('/order/list/:userId', requireSignin, isAuth, isAdmin, listOrders);

/**
 * @route   GET /api/order/status-values/:userId
 * @desc    Fetches the allowed enum status values for an order (e.g., 'Processing', 'Shipped')
 * @access  Private, Admin Only
 */
router.get(
  '/order/status-values/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValues
);

/**
 * @route   PUT /api/order/:orderId/status/:userId
 * @desc    Updates the delivery status of an order
 * @access  Private, Admin Only
 */
router.put(
  '/order/:orderId/status/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  updateOrderStatus
);

// ==========================================
// Route Parameters Middleware
// ==========================================
router.param('userId', userById); // Populates req.profile
router.param('orderId', orderById); // Populates req.order

module.exports = router;
