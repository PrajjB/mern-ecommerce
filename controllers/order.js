// ==========================================
// controllers/order.js - Order Management Logic
// ==========================================
// Handles creating orders after successful payment, fetching orders for the admin dashboard,
// and updating the delivery status of an order.

const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

// ==========================================
// orderById Middleware
// ==========================================
/**
 * @desc    Intercepts routes containing ':orderId'.
 *          Fetches the order from the DB and attaches it to `req.order`.
 */
exports.orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price') // Populate specific product fields within the order
      .exec();
      
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
      });
    }
    
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// Create Order
// ==========================================
/**
 * @desc    Saves a new order to the database. This is called *after* 
 *          payment is successfully processed by Braintree.
 */
exports.create = async (req, res) => {
  try {
    // Attach the user who placed the order (req.profile is populated by userById middleware)
    req.body.order.user = req.profile;
    
    // Create new Order model instance
    const order = new Order(req.body.order);
    
    // Save to MongoDB
    const data = await order.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

// ==========================================
// List All Orders (Admin)
// ==========================================
/**
 * @desc    Fetches all orders in the system, sorted by newest first.
 *          Used to display orders in the Admin dashboard.
 */
exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', '_id name address') // Populate user data so Admin sees who ordered it
      .sort('-created') // Sort descending by creation date
      .exec();
      
    res.json(orders);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

// ==========================================
// Get Order Status Enums
// ==========================================
/**
 * @desc    Returns the possible string values an order status can have 
 *          (e.g., 'Processing', 'Shipped', etc.) defined in the Mongoose schema.
 */
exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path('status').enumValues);
};

// ==========================================
// Update Order Status (Admin)
// ==========================================
/**
 * @desc    Updates the delivery status of a specific order.
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    // Finds the order by ID and updates its 'status' field
    const order = await Order.updateOne(
      { _id: req.body.orderId },
      { $set: { status: req.body.status } }
    );
    res.json(order);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
