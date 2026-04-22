// ==========================================
// validator/index.js - Express Request Validation
// ==========================================
// Uses express-validator to ensure incoming API requests contain correctly formatted data
// before the request reaches the controller.

const { body, validationResult } = require('express-validator');

// ==========================================
// User Signup Validation Middleware
// ==========================================
/**
 * @desc    An array of validation middleware functions executed sequentially.
 *          If validation fails at any step, the final middleware intercepts it
 *          and returns a 400 status with the error message.
 */
exports.userSignupValidator = [
  // 1. Name validation
  body('name')
    .notEmpty()
    .withMessage('Name is required'), // Custom error message if empty

  // 2. Email validation
  body('email')
    .isLength({ min: 4, max: 32 })
    .withMessage('Email must be between 3 to 32 characters')
    .isEmail() // Validates standard email format (e.g., test@test.com)
    .withMessage('Must be a valid email address'),

  // 3. Password validation
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/) // Regex check: must contain at least one digit
    .withMessage('Password must contain a number'),

  // 4. Result Evaluator
  (req, res, next) => {
    // Collects all validation errors found by the previous middleware
    const errors = validationResult(req);
    
    // If there are errors (i.e., array is not empty)
    if (!errors.isEmpty()) {
      // Extract just the first error message to show to the user
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    // If no errors, proceed to the signup controller
    next();
  },
];
