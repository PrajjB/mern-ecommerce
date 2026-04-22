// ==========================================
// controllers/user.js - User Profile Logic
// ==========================================
// Handles reading and updating user information, fetching purchase history,
// and appending orders to a user's purchase history upon checkout.

const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

// ==========================================
// userById Middleware
// ==========================================
/**
 * @desc    Intercepts routes containing ':userId', finds the user in DB, 
 *          and attaches the user object to `req.profile`.
 */
exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    req.profile = user; // Attach the user document to the request object
    next(); // Pass control to the next middleware/route handler
  } catch (err) {
    return res.status(400).json({ error: 'User not found' });
  }
};

// ==========================================
// Read User Profile
// ==========================================
/**
 * @desc    Returns the user profile currently stored in req.profile
 */
exports.read = (req, res) => {
  // Ensure we never send the hashed password and salt to the frontend
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

// ==========================================
// Update User Profile
// ==========================================
/**
 * @desc    Updates user details (e.g., name, password) in the database
 */
exports.update = async (req, res) => {
  try {
    // Find user by ID and apply updates from req.body
    // { new: true } ensures the method returns the updated document, not the old one
    const user = await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true }
    );
    
    if (!user) {
      return res.status(400).json({
        error: 'You are not authorized to perform this action',
      });
    }
    
    // Hide sensitive fields before returning
    user.hashed_password = undefined;
    user.salt = undefined;
    
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: 'You are not authorized to perform this action',
    });
  }
};

// ==========================================
// Add Order to User History Middleware
// ==========================================
/**
 * @desc    Whenever an order is successfully created, this middleware extracts
 *          the purchased items and pushes them into the user's `history` array.
 */
exports.addOrderToUserHistory = async (req, res, next) => {
  let history = [];

  // Iterate over each product in the order and build the history object
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  try {
    // Find the user and push the entire history array into their history field
    await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $push: { history: history } }, // Append new items to existing history
      { new: true }
    );
    next(); // Proceed to actually create the order (create order controller)
  } catch (error) {
    return res.status(400).json({
      error: 'Could not update user purchase history',
    });
  }
};

// ==========================================
// Get User Purchase History
// ==========================================
/**
 * @desc    Finds all orders placed by this user ID.
 */
exports.purchaseHistory = async (req, res) => {
  try {
    // Find orders where the `user` reference matches the current user's ID
    const orders = await Order.find({ user: req.profile._id })
      .populate('user', '_id name') // Populate user details (id and name) inside the order
      .sort('-created'); // Sort by descending creation date (newest first)
      
    res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// Get All Users (Admin utility)
// ==========================================
/**
 * @desc    Fetches all registered users
 */
exports.users = async (req, res) => {
  try {
    const users = await User.find().exec();
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
