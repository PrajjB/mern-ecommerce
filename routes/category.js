// ==========================================
// routes/category.js - Category API Routes
// ==========================================
// Handles all CRUD (Create, Read, Update, Delete) operations for product categories.

const express = require('express');
const router = express.Router();

// Import Category controller functions
const {
  create,
  categoryById,
  read,
  update,
  remove,
  list
} = require('../controllers/category');

// Import Auth and User middlewares to protect routes
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   GET /api/category/:categoryId
 * @desc    Read a single category by its ID
 * @access  Public
 */
router.get('/category/:categoryId', read);

/**
 * @route   POST /api/category/create/:userId
 * @desc    Create a new product category
 * @access  Private, Admin Only
 * @flow    1. Authenticate user -> 2. Check if admin -> 3. Execute `create`
 */
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);

/**
 * @route   PUT /api/category/:categoryId/:userId
 * @desc    Update an existing product category
 * @access  Private, Admin Only
 */
router.put(
  '/category/:categoryId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  update
);

/**
 * @route   DELETE /api/category/:categoryId/:userId
 * @desc    Delete a product category
 * @access  Private, Admin Only
 */
router.delete(
  '/category/:categoryId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  remove
);

/**
 * @route   GET /api/categories
 * @desc    Get a list of all categories
 * @access  Public
 */
router.get('/categories', list);

// ==========================================
// Route Parameters Middleware
// ==========================================
// If `:categoryId` is in the URL, fetch the category and attach to `req.category`
router.param('categoryId', categoryById);
// If `:userId` is in the URL, fetch the user and attach to `req.profile`
router.param('userId', userById);

module.exports = router;
