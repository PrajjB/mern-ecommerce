// ==========================================
// models/user.js - User Database Schema
// ==========================================
// This file defines the Mongoose schema and model for a User in the database.
// It includes the schema definition, a virtual field for handling plain text passwords,
// and custom methods for password encryption and authentication.

const mongoose = require('mongoose');
const crypto = require('crypto'); // Node.js built-in module for cryptographic functionality
const { v1: uuidv1 } = require('uuid'); // Module to generate unique IDs (used for password salts)

// Define the structure of the User document
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // Automatically removes whitespace from both ends of the string
      required: true, // This field is mandatory
      maxlength: 32, // Maximum length of the user's name
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true, // Ensures no two users can register with the same email
    },
    hashed_password: {
      type: String,
      required: true, // We store the hashed password, NOT the plain text password for security
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String, // A unique string added to the password before hashing to defend against rainbow table attacks
    role: {
      type: Number,
      default: 0, // 0 = standard user, 1 = admin
    },
    history: {
      type: Array, // Stores the user's purchase history
      default: [],
    },
  },
  { timestamps: true } // Automatically creates 'createdAt' and 'updatedAt' fields
);

// ==========================================
// Virtual Fields
// ==========================================
// Virtuals are document properties that you can get and set but that do not get persisted to MongoDB.
userSchema
  .virtual('password')
  .set(function (password) {
    // When a password is set (e.g., during registration), temporarily save the plain password
    this._password = password;
    // Generate a unique salt for this user
    this.salt = uuidv1();
    // Encrypt the password and save it to the actual database field 'hashed_password'
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// ==========================================
// Instance Methods
// ==========================================
// These methods are available on every initialized user document.
userSchema.methods = {
  /**
   * authenticate
   * Compares the provided plain text password with the stored hashed password.
   * @param {String} plainText - The password provided during login
   * @returns {Boolean} - True if passwords match, false otherwise
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * encryptPassword
   * Hashes the plain text password using HMAC-SHA1 and the user's unique salt.
   * @param {String} password - The plain text password
   * @returns {String} - The encrypted hash
   */
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};

// Compile and export the model
module.exports = mongoose.model('User', userSchema);
