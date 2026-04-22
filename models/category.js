// ==========================================
// models/category.js - Category Database Schema
// ==========================================
// This file defines the Mongoose schema and model for product Categories.
// Categories allow products to be grouped together (e.g., 'Electronics', 'Books').

const mongoose = require('mongoose');

// Define the structure of the Category document
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // Automatically strips whitespace from beginning and end
      required: true, // A category must have a name
      maxlength: 32, // Limits the category name to 32 characters
      unique: true, // Ensures no two categories can have the exact same name
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' timestamp fields
);

// Compile the schema into a model and export it for use in controllers
module.exports = mongoose.model('Category', categorySchema);
