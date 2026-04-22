// ==========================================
// auth/AdminRoute.jsx - Admin Protected Route Wrapper
// ==========================================
// A Higher-Order Component (HOC) used in the React Router setup.
// It wraps around routes that should ONLY be accessible to Administrators (Role === 1).
// If a standard user or an unauthenticated user tries to access the route, they are redirected.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './index';

const AdminRoute = ({ children }) => {
  // Check if a user is logged in and retrieve their data from localStorage
  const auth = isAuthenticated();
  
  // Logic: 
  // 1. Is there an authenticated user? (auth is not false)
  // 2. Does that user have the Admin role? (auth.user.role === 1)
  return auth && auth.user.role === 1 ? (
    // If yes, render the protected component (e.g., AdminDashboard)
    children
  ) : (
    // If no, immediately redirect them to the sign-in page
    <Navigate to='/signin' replace />
  );
};

export default AdminRoute;
