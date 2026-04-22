// ==========================================
// controllers/auth.js - Auth Logic
// ==========================================
// Contains the business logic for user authentication (signup, signin, signout)
// and middleware functions to protect routes from unauthorized access.

const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Used to generate signed tokens for authentication
const { expressjwt } = require('express-jwt'); // Middleware that validates JWTs and extracts user info
const { errorHandler } = require('../helpers/dbErrorHandler');

require('dotenv').config();

// ==========================================
// User Registration (Signup)
// ==========================================
/**
 * @desc    Creates a new user in the database
 * @param   {Object} req - Express request object containing user details in req.body
 * @param   {Object} res - Express response object
 */
exports.signup = async (req, res) => {
  // Instantiate a new User model with the request body data
  const user = new User(req.body);
  try {
    // Attempt to save the user to MongoDB. 
    // The pre-save hook/virtual field in the User model will automatically hash the password.
    const data = await user.save();
    
    if (!data) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    // Remove sensitive information before sending the response back to the client
    user.salt = undefined;
    user.hashed_password = undefined;
    
    // Return the created user object
    res.json({
      user,
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// ==========================================
// User Login (Signin)
// ==========================================
/**
 * @desc    Authenticates a user and issues a JWT cookie
 */
exports.signin = async (req, res) => {
  // Destructure email and password from the request body
  const { email, password } = req.body;

  try {
    // 1. Check if a user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }

    // 2. If user exists, verify that the provided password matches the hashed password in the DB
    // The `authenticate` method is defined in models/user.js
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password didn't match",
      });
    }

    // 3. Generate a JSON Web Token (JWT) using the user's ID and our secret key
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // 4. Save the token in a cookie named 't' with an expiration date
    res.cookie('t', token, { expire: new Date() + 9999 });

    // 5. Send the token and user details to the frontend
    const { _id, name, email: userEmail, role } = user;
    return res.json({ token, user: { _id, email: userEmail, name, role } });
  } catch (err) {
    return res.status(400).json({
      error: 'Signin failed. Please try again later.',
    });
  }
};

// ==========================================
// User Logout (Signout)
// ==========================================
/**
 * @desc    Logs the user out by clearing the authentication cookie
 */
exports.signout = (req, res) => {
  // Clear the cookie named 't'
  res.clearCookie('t');
  res.json({ message: 'Signout success' });
};

// ==========================================
// Middleware: Require Signin
// ==========================================
/**
 * @desc    Validates the JWT token attached to the request headers.
 *          If valid, it appends the decoded user ID to `req.auth`.
 */
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth', // Defines where the decoded token payload will be attached (req.auth)
});

// ==========================================
// Middleware: Ensure User is Authenticated
// ==========================================
/**
 * @desc    Ensures that the logged-in user is the one trying to access/modify the resource.
 *          Compares `req.profile` (from URL param) with `req.auth` (from JWT).
 */
exports.isAuth = (req, res, next) => {
  // user is true ONLY if req.profile exists, req.auth exists, AND their IDs match.
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }
  next(); // Pass control to the next middleware/controller
};

// ==========================================
// Middleware: Ensure User is Admin
// ==========================================
/**
 * @desc    Checks if the authenticated user has admin privileges (role === 1).
 */
exports.isAdmin = (req, res, next) => {
  // 0 = standard user, 1 = admin
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: 'Admin resource! Access denied',
    });
  }
  next();
};
