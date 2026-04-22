// ==========================================
// auth/index.js - Authentication Service API
// ==========================================
// Centralized file for all authentication-related API calls and localStorage management.
// Handles signup, signin, signout, and retrieving the currently logged-in user.

import { API } from '../config';

// ==========================================
// Sign Up (Register)
// ==========================================
export const signup = (user) => {
  // Make a POST request to the backend signup route
  return fetch(`${API}/signup`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json', // Tell the server we are sending JSON
    },
    body: JSON.stringify(user), // Convert the user JS object to a JSON string
  })
    .then((response) => {
      return response.json(); // Parse the server's JSON response
    })
    .catch((err) => {
      console.log(err);
    });
};

// ==========================================
// Sign In (Login)
// ==========================================
export const signin = (user) => {
  // Make a POST request to the backend signin route
  return fetch(`${API}/signin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user), // Contains email and password
  })
    .then((response) => {
      return response.json(); // Returns the JWT token and user details if successful
    })
    .catch((err) => {
      console.log(err);
    });
};

// ==========================================
// Authenticate (Save Token)
// ==========================================
// Middleware-like function that saves the JWT token to localStorage after a successful signin
export const authenticate = (data, next) => {
  if (typeof window !== 'undefined') {
    // Save the token and user data as a string in the browser's localStorage
    localStorage.setItem('jwt', JSON.stringify(data));
    next(); // Callback to redirect or update state in the React component
  }
};

// ==========================================
// Sign Out (Logout)
// ==========================================
export const signout = (next) => {
  if (typeof window !== 'undefined') {
    // 1. Remove the token from the browser
    localStorage.removeItem('jwt');
    
    // 2. Execute the callback (usually to redirect the user to the home page)
    next();
    
    // 3. Inform the backend to clear the cookie (if cookie-based auth was also used)
    return fetch(`${API}/signout`, {
      method: 'GET',
    })
      .then((response) => {
        console.log('signout', response);
      })
      .catch((err) => console.log(err));
  }
};

// ==========================================
// Check Authentication Status
// ==========================================
// Utility function used throughout the app to determine if a user is logged in
// and to retrieve their details (e.g., ID, name, role).
export const isAuthenticated = () => {
  // If we are in a server-side rendering environment (like Next.js), return false
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if the 'jwt' key exists in localStorage
  if (localStorage.getItem('jwt')) {
    // Parse the JSON string back into a JavaScript object
    return JSON.parse(localStorage.getItem('jwt'));
  } else {
    // User is not logged in
    return false;
  }
};
