// ==========================================
// controllers/category.js - Category Logic
// ==========================================
// Manages the creation, reading, updating, and deletion (CRUD) of product categories.

const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');

// ==========================================
// categoryById Middleware
// ==========================================
/**
 * @desc    Intercepts any route containing ':categoryId'.
 *          Finds the category by ID and attaches it to `req.category`.
 */
exports.categoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id).exec();
    if (!category) {
      return res.status(400).json({
        error: "Category doesn't exist",
      });
    }
    req.category = category; // Attach to request object
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// Create Category
// ==========================================
/**
 * @desc    Creates a new category based on req.body
 */
exports.create = async (req, res) => {
  const category = new Category(req.body); // Instantiate new model
  try {
    const data = await category.save(); // Save to database
    res.json({ data });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err), // Returns a formatted error message if creation fails (e.g., duplicate name)
    });
  }
};

// ==========================================
// Read Category
// ==========================================
/**
 * @desc    Returns the single category requested (populated by categoryById middleware)
 */
exports.read = (req, res) => {
  return res.json(req.category);
};

// ==========================================
// Update Category
// ==========================================
/**
 * @desc    Updates the name of an existing category
 */
exports.update = async (req, res) => {
  const category = req.category; // Grab the category fetched by categoryById
  category.name = req.body.name; // Update the name field
  
  try {
    const data = await category.save(); // Save changes
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// Delete Category
// ==========================================
/**
 * @desc    Removes a category from the database
 */
exports.remove = async (req, res) => {
  const category = req.category;
  try {
    await category.remove(); // Execute delete operation
    res.json({
      message: 'Category deleted',
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// List All Categories
// ==========================================
/**
 * @desc    Returns all categories in the database
 */
exports.list = async (req, res) => {
  try {
    const data = await Category.find().exec(); // Fetch all category documents
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
