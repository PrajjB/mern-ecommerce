// ==========================================
// models/product.js - Product Database Schema
// ==========================================
// This file defines the Mongoose schema and model for Products.
// It includes relationships to the Category model and handles image storage
// via the Buffer data type for binary image data.

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema; // Extracts ObjectId type for referencing other models

// Define the structure of the Product document
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000, // Products can have long descriptions
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },
    // The category field establishes a relationship with the Category model
    category: {
      type: ObjectId, // Stores the unique ID of the related Category document
      ref: 'Category', // Specifies which model this ID refers to
      required: true,
    },
    quantity: {
      type: Number, // The total stock available for this product
    },
    sold: {
      type: Number, // Tracks how many units of this product have been sold
      default: 0,
    },
    // The photo field stores binary image data directly in the database
    // Note: Storing images in the DB is okay for small projects, but for production,
    // cloud storage (like AWS S3) with a URL reference is recommended.
    photo: {
      data: Buffer, // Binary data of the image
      contentType: String, // MIME type (e.g., 'image/png' or 'image/jpeg')
    },
    shipping: {
      required: false,
      type: Boolean, // Indicates if the product requires physical shipping
    },
  },
  { timestamps: true } // Automatically manages 'createdAt' and 'updatedAt'
);

// Compile the schema into a model and export it
module.exports = mongoose.model('Product', productSchema);
