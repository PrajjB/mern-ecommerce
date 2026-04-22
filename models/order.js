// ==========================================
// models/order.js - Order Database Schema
// ==========================================
// This file defines the Mongoose schemas for Orders and CartItems.
// Because an order consists of multiple items from a cart, we define a smaller
// CartItemSchema and embed it within the main OrderSchema.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema; // Extracted to create relations with other models

// ==========================================
// CartItem Schema
// ==========================================
// Defines the structure for a single item inside an order
const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' }, // Reference to the exact Product document
    name: String, // Product name at the time of purchase
    price: Number, // Price at the time of purchase
    count: Number, // Quantity purchased
  },
  { timestamps: true }
);

// Compile CartItem model
const CartItem = mongoose.model('CartItem', CartItemSchema);

// ==========================================
// Order Schema
// ==========================================
// Defines the structure for the entire user order
const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema], // Array of CartItem objects representing the purchased items
    transaction_id: {}, // Transaction ID returned from the payment gateway (e.g., Braintree)
    amount: { type: Number }, // Total amount paid for the order
    address: String, // Delivery address provided by the user
    status: {
      type: String,
      default: 'Not processed',
      // The enum restricts the 'status' field to only these specific string values
      enum: [
        'Not processed', // Default state when an order is created
        'Processing',    // Admin has started processing the order
        'Shipped',       // Order has left the facility
        'Delivered',     // Order has reached the customer
        'Cancelled',     // Order was cancelled
      ],
    },
    updated: Date, // Tracks when the status was last updated
    user: { type: ObjectId, ref: 'User' }, // Reference to the User who placed the order
  },
  { timestamps: true } // Automatically manages 'createdAt' and 'updatedAt'
);

// Compile Order model
const Order = mongoose.model('Order', OrderSchema);

// Export both models so they can be used in controllers
module.exports = { Order, CartItem };
