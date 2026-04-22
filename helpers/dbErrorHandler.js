'use strict';
// ==========================================
// helpers/dbErrorHandler.js - MongoDB Error Formatter
// ==========================================
// Converts complex, unreadable MongoDB error objects into clean, 
// user-friendly string messages for the frontend.

/**
 * @desc    Parses the cryptic MongoDB unique constraint error message.
 * @param   {Object} error - The raw MongoDB error object
 * @returns {String} - A clean message like "Email already exists"
 */
const uniqueMessage = (error) => {
  let output;
  try {
    // Example MongoDB Error: 'E11000 duplicate key error collection: test.users index: email_1 dup key...'
    // This substring logic extracts the specific field name (e.g., 'email') from the raw message
    let fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1')
    );
    // Capitalize the first letter and append 'already exists'
    output =
      fieldName.charAt(0).toUpperCase() +
      fieldName.slice(1) +
      ' already exists';
  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};

/**
 * @desc    Main error handler exported to controllers. Determines the type of DB error.
 * @param   {Object} error - The raw MongoDB error object
 * @returns {String} - Formatted error message
 */
exports.errorHandler = (error) => {
  let message = '';

  // Check if the error has a specific MongoDB code
  if (error.code) {
    switch (error.code) {
      case 11000: // Code 11000 and 11001 represent Duplicate Key Errors (Unique Constraint Violation)
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    // If it's a validation error (e.g., missing required field in Mongoose schema)
    // iterate over the error keys and extract the first available message
    for (let errorName in error.errorors) { // Note: 'errorors' seems to be a typo in the original codebase, likely meant 'errors'
      if (error.errorors[errorName].message)
        message = error.errorors[errorName].message;
    }
  }

  return message;
};
