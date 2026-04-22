// ==========================================
// controllers/product.js - Product Management Logic
// ==========================================
// Handles all aspects of product management including creation with image upload,
// updating, deleting, searching, and advanced filtering.

const formidable = require('formidable'); // Library for parsing form data, especially file uploads
const _ = require('lodash'); // Utility library, used here to easily merge/update objects
const fs = require('fs'); // Node.js file system module for reading the uploaded image file
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');

// ==========================================
// productById Middleware
// ==========================================
/**
 * @desc    Intercepts routes containing ':productId'.
 *          Fetches the product from DB (along with its category data) and attaches it to `req.product`.
 */
exports.productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id).populate('category').exec();
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Product not found' });
  }
};

// ==========================================
// Read Product
// ==========================================
/**
 * @desc    Returns a single product based on the req.product set by `productById`.
 */
exports.read = (req, res) => {
  // We do not send the binary photo data here to keep the response fast.
  // The photo is fetched via a separate API route.
  req.product.photo = undefined;
  return res.json(req.product);
};

// ==========================================
// Create Product (with Image Upload)
// ==========================================
/**
 * @desc    Creates a new product. Uses `formidable` because standard `bodyParser`
 *          cannot handle `multipart/form-data` (which is required for file uploads).
 */
exports.create = async (req, res) => {
  const form = new formidable.IncomingForm(); // Create form parser instance
  form.keepExtensions = true; // Retain file extensions (.jpg, .png, etc.)

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    // Check that all required text fields are present
    const { name, description, price, category, quantity, shipping } = fields;
    if (!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Initialize the Product model with the text fields
    let product = new Product(fields);

    // If a photo was included in the upload
    if (files.photo) {
      // Validate file size (1MB = 1000000 bytes). Large images slow down the DB.
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1MB in size' });
      }
      // Read the file from the temporary system path into a binary Buffer
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type; // e.g., 'image/jpeg'
    }

    try {
      const result = await product.save(); // Save to DB
      res.json(result);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
  });
};

// ==========================================
// Delete Product
// ==========================================
/**
 * @desc    Deletes a product from the database
 */
exports.remove = async (req, res) => {
  try {
    let product = req.product; // Loaded by productById
    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

// ==========================================
// Update Product
// ==========================================
/**
 * @desc    Updates an existing product's text fields and/or its image.
 */
exports.update = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    let product = req.product;
    // Uses Lodash's `extend` method to merge the old product data with the newly submitted fields
    product = _.extend(product, fields);

    // Process new photo if one was uploaded
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1MB in size' });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    try {
      const result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
  });
};

// ==========================================
// List Products (Dynamic Filtering)
// ==========================================
/**
 * @desc    Returns a list of products. Can be queried via URL params:
 *          - by sell: /products?sortBy=sold&order=desc&limit=4
 *          - by arrival: /products?sortBy=createdAt&order=desc&limit=4
 *          - default: all products, limit 6
 */
exports.list = async (req, res) => {
  const order = req.query.order || 'asc';
  const sortBy = req.query.sortBy || '_id';
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const products = await Product.find()
      .select('-photo') // Exclude heavy photo binary data
      .populate('category') // Include category name instead of just ID
      .sort([[sortBy, order]])
      .limit(limit)
      .exec();
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// ==========================================
// List Related Products
// ==========================================
/**
 * @desc    Finds other products in the same category as the current product,
 *          excluding the current product itself. Useful for "You might also like..." section.
 */
exports.listRelated = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const products = await Product.find({
      _id: { $ne: req.product._id }, // $ne = not equal (exclude current product)
      category: req.product.category, // Match same category
    })
      .limit(limit)
      .populate('category', '_id name')
      .exec();
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// ==========================================
// List Categories In Use
// ==========================================
/**
 * @desc    Returns an array of categories that are actively assigned to at least one product.
 */
exports.listCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', {}).exec();
    res.json(categories);
  } catch (error) {
    return res.status(400).json({ error: 'Categories not found' });
  }
};

// ==========================================
// List By Advanced Search (Shop Sidebar)
// ==========================================
/**
 * @desc    Filters products based on category checkboxes and price radio buttons
 *          from the frontend Shop page sidebar.
 */
exports.listBySearch = async (req, res) => {
  const order = req.body.order || 'desc';
  const sortBy = req.body.sortBy || '_id';
  const limit = req.body.limit ? parseInt(req.body.limit) : 100;
  const skip = parseInt(req.body.skip); // Used for 'Load More' pagination
  const findArgs = {};

  // Parse the filters array sent from the frontend
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // Build a MongoDB query for price range (e.g., $gte: 0, $lte: 10)
        findArgs[key] = {
          $gte: req.body.filters[key][0], // Greater than or equal to
          $lte: req.body.filters[key][1], // Less than or equal to
        };
      } else {
        // Normal array match (e.g., categories)
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    const products = await Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec();
    res.json({ size: products.length, data: products });
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// ==========================================
// Serve Product Photo
// ==========================================
/**
 * @desc    Returns the raw binary data of a product's image. 
 *          This route acts as an image source URL (e.g., <img src="/api/product/photo/123" />).
 */
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType); // Tell browser it's an image
    return res.send(req.product.photo.data); // Send raw binary data
  }
  next();
};

// ==========================================
// Global Search Bar Handler
// ==========================================
/**
 * @desc    Finds products matching a user's text query (and optional category dropdown).
 */
exports.listSearch = async (req, res) => {
  const query = {};

  if (req.query.search) {
    // Uses a regular expression for partial, case-insensitive ('i') matching
    query.name = { $regex: req.query.search, $options: 'i' };

    // If a specific category was selected (and it's not "All")
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    try {
      const products = await Product.find(query).select('-photo').exec();
      res.json(products);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
  }
};

// ==========================================
// Inventory Management (Decrease Quantity)
// ==========================================
/**
 * @desc    Decrements the 'quantity' (stock) and increments the 'sold' count
 *          for every product inside an order. Used as middleware during order creation.
 */
exports.decreaseQuantity = async (req, res, next) => {
  // Map over the ordered items and build bulk operations for MongoDB
  const bulkOps = req.body.order.products.map((item) => ({
    updateOne: {
      filter: { _id: item._id }, // Find the product
      update: { $inc: { quantity: -item.count, sold: +item.count } }, // Decrease quantity, increase sold
    },
  }));

  try {
    // Perform all updates simultaneously for efficiency
    await Product.bulkWrite(bulkOps, {});
    next(); // Pass control to the next middleware (which creates the order)
  } catch (error) {
    return res.status(400).json({ error: 'Could not update product' });
  }
};
