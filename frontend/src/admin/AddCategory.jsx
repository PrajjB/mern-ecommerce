// ==========================================
// admin/AddCategory.jsx - Create Category Form
// ==========================================
// This component provides a form for Administrators to create new product categories.
// It sends a POST request to the backend and displays success or error messages.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar';
import { isAuthenticated } from '../auth'; // Helper to get user ID and Token
import { createCategory } from './apiAdmin'; // API helper for the POST request

const AddCategory = () => {
  // State for the category name input field
  const [name, setName] = useState('');
  
  // State to handle UI feedback (success/error banners)
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Destructure the currently logged-in admin's details
  const { user, token } = isAuthenticated();

  // ==========================================
  // Input Change Handler
  // ==========================================
  const handleChange = (e) => {
    setError(''); // Clear any previous errors as soon as the user starts typing
    setName(e.target.value); // Update the controlled input state
  };

  // ==========================================
  // Form Submission
  // ==========================================
  const clickSubmit = (e) => {
    e.preventDefault(); // Prevent the browser from refreshing the page on form submit
    setError('');
    setSuccess(false);
    
    // Make request to the API to create the category
    // Requires: Admin's User ID (URL param), Admin's JWT Token (Header), and Category Data (Body)
    createCategory(user._id, token, { name }).then((data) => {
      if (data.error) {
        setError(data.error); // E.g., "Category name must be unique"
      } else {
        setError('');
        setSuccess(true); // Triggers the success banner
      }
    });
  };

  // ==========================================
  // Render Form UI
  // ==========================================
  const newCategoryForm = () => (
    <Box
      component='form'
      onSubmit={clickSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        width: '100%',
      }}
    >
      <TextField
        label='Category Name'
        variant='outlined'
        value={name}
        onChange={handleChange}
        autoFocus // Automatically place cursor in this field when page loads
        required // HTML5 validation
        fullWidth
      />
      <Button
        type='submit'
        variant='contained'
        color='primary'
        sx={{ alignSelf: 'flex-start', px: 4 }}
      >
        Create Category
      </Button>
    </Box>
  );

  // ==========================================
  // Feedback Banners
  // ==========================================
  const showSuccess = () => {
    if (success) {
      return (
        <Alert severity='success' sx={{ width: '100%' }}>
          Category <strong>{name}</strong> has been created successfully!
        </Alert>
      );
    }
  };

  const showError = () => {
    if (error) {
      return (
        <Alert severity='error' sx={{ width: '100%' }}>
          Category should be unique.
        </Alert>
      );
    }
  };

  // Navigation button to easily return to the main dashboard
  const goBack = () => (
    <Button
      component={Link}
      to='/admin/dashboard'
      variant='outlined'
      color='warning'
      sx={{ mt: 2 }}
    >
      Back to Dashboard
    </Button>
  );

  return (
    <Layout
      title='Add a new category'
      description={`Hey ${user.name}, ready to add a new category?`}
    >
      <Grid container spacing={2}>
        {/* LEFT SIDEBAR: Standard Admin Navigation */}
        <AdminSidebar />
  
        {/* MAIN CONTENT: Form Area */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            <CardHeader
              title='Add New Category'
              sx={{
                bgcolor: 'background.paper',
              }}
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'flex-start',
                  maxWidth: 500,
                  width: '100%',
                }}
              >
                {/* Render Feedback and Form */}
                {showSuccess()}
                {showError()}
                {newCategoryForm()}
                {goBack()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default AddCategory;
