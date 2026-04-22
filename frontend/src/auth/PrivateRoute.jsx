// ==========================================
// auth/PrivateRoute.jsx - User Protected Route Wrapper
// ==========================================
// A Higher-Order Component (HOC) used in the React Router setup.
// It wraps around routes that require a user to be logged in (e.g., UserDashboard, Checkout).
// If an unauthenticated user tries to access the route, they are redirected to the sign-in page.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './index';

const PrivateRoute = ({ children }) => {
  // Logic: Check localStorage via isAuthenticated(). 
  // If true (token exists), render the component. If false, redirect to login.
  return isAuthenticated() ? children : <Navigate to='/signin' replace />;
};

export default PrivateRoute;
