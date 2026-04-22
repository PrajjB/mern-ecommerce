// ==========================================
// routes/product.js - Product API Routes
// ==========================================
// Handles all CRUD operations, searching, and advanced filtering for Products.

const express = require('express');
const router = express.Router();

// Import Product controller functions
const {
  create,
  productById,
  read,
  update,
  remove,
  list, // List products with optional queries (sortBy, order, limit)
  listRelated, // Find products in the same category
  listCategories, // Find all unique categories currently holding products
  listBySearch, // Filter products by category checkboxes and price radio buttons
  photo, // Fetch product image as raw binary
  listSearch // Search products via the text search bar
} = require('../controllers/product');

// Import Auth and User middlewares
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

// ==========================================
// Route Definitions
// ==========================================

/**
 * @route   GET /api/product/:productId
 * @desc    Read a single product by its ID
 * @access  Public
 */
router.get('/product/:productId', read);

/**
 * @route   POST /api/product/create/:userId
 * @desc    Create a new product (with image upload)
 * @access  Private, Admin Only
 */
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);

/**
 * @route   DELETE /api/product/:productId/:userId
 * @desc    Delete a product
 * @access  Private, Admin Only
 */
router.delete(
  '/product/:productId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  remove
);

/**
 * @route   PUT /api/product/:productId/:userId
 * @desc    Update an existing product
 * @access  Private, Admin Only
 */
router.put(
  '/product/:productId/:userId',
  requireSignin,
  isAuth,
  isAdmin,
  update
);

/**
 * @route   GET /api/products
 * @desc    Get products based on query params (e.g., ?sortBy=sold&order=desc&limit=4)
 * @access  Public
 */
router.get('/products', list);

/**
 * @route   GET /api/products/search
 * @desc    Perform a text-based search for products
 * @access  Public
 */
router.get('/products/search', listSearch);

/**
 * @route   GET /api/products/related/:productId
 * @desc    Fetch products that belong to the same category as the given product
 * @access  Public
 */
router.get('/products/related/:productId', listRelated);

/**
 * @route   GET /api/products/categories
 * @desc    Fetch only the categories that currently have products associated with them
 * @access  Public
 */
router.get('/products/categories', listCategories);

/**
 * @route   POST /api/products/by/search
 * @desc    Filter products based on selected categories and price ranges (for the Shop page sidebar)
 * @access  Public
 */
router.post('/products/by/search', listBySearch);

/**
 * @route   GET /api/product/photo/:productId
 * @desc    Serves the product's image binary data
 * @access  Public
 * @note    Used as the src for HTML <img> tags
 */
router.get('/product/photo/:productId', photo);

// ==========================================
// Route Parameters Middleware
// ==========================================
// Intercepts URLs with `:userId`, fetches the user, and attaches to req.profile
router.param('userId', userById);
// Intercepts URLs with `:productId`, fetches the product, and attaches to req.product
router.param('productId', productById);

module.exports = router;
