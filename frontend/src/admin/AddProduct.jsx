// ==========================================
// admin/AddProduct.jsx - Create Product Form
// ==========================================
// Allows Administrators to add new products to the store.
// Features a complex form handling file uploads (images) and dynamic dropdowns (categories).
// Uses JavaScript's `FormData` API to send multipart/form-data to the backend.

import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Typography,
} from '@mui/material';
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar';
import { isAuthenticated } from '../auth';
import { createProduct, getCategories } from './apiAdmin'; // API helpers

const AddProduct = () => {
  // ==========================================
  // Form State Management
  // ==========================================
  // Stores all the input values for the product
  const [values, setValues] = useState({
    name: '',
    description: '',
    price: '',
    categories: [], // Available categories fetched from the DB for the dropdown
    category: '', // The specific category ID selected by the user
    shipping: '', // '0' or '1'
    quantity: '',
    photo: null, // The actual image file object
    loading: false, // Used to show a loading spinner during submission
    error: '',
    createdProduct: '', // Name of the successfully created product for the success message
    formData: new FormData(), // The object used to compile all data (including the image) for the API
  });

  // Tracks which fields the user has interacted with (used for validation display)
  const [touched, setTouched] = useState({
    name: false,
    description: false,
    price: false,
    category: false,
    shipping: false,
    quantity: false,
    photo: false,
  });

  const { user, token } = isAuthenticated();

  // Destructure for easier access in the JSX
  const {
    name,
    description,
    price,
    categories,
    category,
    shipping,
    quantity,
    loading,
    error,
    createdProduct,
    formData,
  } = values;

  // ==========================================
  // Validation Logic
  // ==========================================
  // Checks if all required fields are filled out correctly
  const validate = () => {
    return (
      name.trim() !== '' &&
      description.trim() !== '' &&
      price > 0 &&
      category !== '' &&
      shipping !== '' &&
      quantity > 0 &&
      formData.get('photo') !== null // Ensure an image file was attached
    );
  };

  // Boolean flag used to enable/disable the submit button
  const isFormValid = validate();

  // ==========================================
  // Initialization
  // ==========================================
  // Fetches available categories from the backend to populate the dropdown
  const init = () => {
    getCategories().then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          categories: data,
        });
      }
    });
  };

  useEffect(() => {
    init();
  }, []);

  // ==========================================
  // Input Change Handlers
  // ==========================================
  const handleChange = (name) => (event) => {
    // If the field is the file input ('photo'), get the file object from `event.target.files[0]`
    // Otherwise, get the text value from `event.target.value`
    const value = name === 'photo' ? event.target.files[0] : event.target.value;

    // We must manually update the FormData object which will be sent to the backend.
    // Creating a new FormData instance and copying existing data prevents weird state bugs.
    const newFormData = new FormData();
    for (let [key, val] of formData.entries()) {
      if (key !== name) {
        newFormData.set(key, val);
      }
    }
    
    // Add the newly changed value to the FormData object
    if (value !== undefined && value !== null) {
      newFormData.set(name, value);
    }

    // Update React State
    setValues({
      ...values,
      [name]: value,
      formData: newFormData,
      error: '',
    });

    // Mark field as touched for validation
    setTouched({ ...touched, [name]: true });
  };

  // Mark field as touched when the user clicks out of it
  const handleBlur = (field) => () => {
    setTouched({ ...touched, [field]: true });
  };

  // ==========================================
  // Form Submission
  // ==========================================
  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: '', loading: true });

    // Send the compiled `formData` object to the API.
    // Note: Because `formData` contains a file, we DO NOT set Content-Type to JSON.
    // The browser automatically sets it to multipart/form-data.
    createProduct(user._id, token, formData).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, loading: false });
      } else {
        // Reset form upon success
        setValues({
          ...values,
          name: '',
          description: '',
          photo: null,
          price: '',
          quantity: '',
          category: '',
          shipping: '',
          loading: false,
          createdProduct: data.name,
          formData: new FormData(), // Clear out the FormData object
        });
        setTouched({
          name: false,
          description: false,
          price: false,
          category: false,
          shipping: false,
          quantity: false,
          photo: false,
        });
      }
    });
  };

  // ==========================================
  // Render Form UI
  // ==========================================
  const newPostForm = () => (
    <Box component='form' onSubmit={clickSubmit} sx={{ fullWidth: true }}>
      
      {/* File Upload Input */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant='outlined'
          component='label'
          fullWidth
          color={touched.photo && !formData.get('photo') ? 'error' : 'primary'}
        >
          Upload Product Photo
          <input
            type='file'
            name='photo'
            accept='image/*'
            onChange={handleChange('photo')}
            onBlur={handleBlur('photo')}
            hidden // Hide actual HTML input, style the MUI Button instead
          />
        </Button>
        {touched.photo && !formData.get('photo') && (
          <FormHelperText error>Product photo is required</FormHelperText>
        )}
      </Box>

      {/* Standard Text Inputs */}
      <TextField
        label='Product Name'
        variant='outlined'
        fullWidth
        margin='normal'
        value={name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={touched.name && name.trim() === ''}
        helperText={
          touched.name && name.trim() === '' ? 'Product name is required' : ''
        }
        required
      />

      <TextField
        label='Description'
        variant='outlined'
        fullWidth
        margin='normal'
        multiline
        rows={4} // Makes it a larger text area
        value={description}
        onChange={handleChange('description')}
        onBlur={handleBlur('description')}
        error={touched.description && description.trim() === ''}
        helperText={
          touched.description && description.trim() === ''
            ? 'Description is required'
            : ''
        }
        required
      />

      <TextField
        label='Price'
        variant='outlined'
        fullWidth
        margin='normal'
        type='number'
        value={price}
        onChange={handleChange('price')}
        onBlur={handleBlur('price')}
        error={touched.price && (price === '' || price <= 0)}
        helperText={
          touched.price && (price === '' || price <= 0)
            ? 'Price must be greater than 0'
            : ''
        }
        required
        inputProps={{ min: 0, step: 0.01 }}
      />

      {/* Category Dropdown (Populated from DB) */}
      <FormControl
        fullWidth
        margin='normal'
        error={touched.category && category === ''}
      >
        <InputLabel id='category-label'>Category *</InputLabel>
        <Select
          labelId='category-label'
          value={category}
          label='Category *'
          onChange={handleChange('category')}
          onBlur={handleBlur('category')}
        >
          <MenuItem value=''>
            <em>Select a category</em>
          </MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
        {touched.category && category === '' && (
          <FormHelperText>Category is required</FormHelperText>
        )}
      </FormControl>

      {/* Shipping Dropdown (Boolean mapping) */}
      <FormControl
        fullWidth
        margin='normal'
        error={touched.shipping && shipping === ''}
      >
        <InputLabel id='shipping-label'>Shipping *</InputLabel>
        <Select
          labelId='shipping-label'
          value={shipping}
          label='Shipping *'
          onChange={handleChange('shipping')}
          onBlur={handleBlur('shipping')}
        >
          <MenuItem value=''>
            <em>Select shipping option</em>
          </MenuItem>
          {/* Note: Values are sent as strings '0' and '1', parsed as boolean by backend */}
          <MenuItem value='0'>No</MenuItem>
          <MenuItem value='1'>Yes</MenuItem>
        </Select>
        {touched.shipping && shipping === '' && (
          <FormHelperText>Shipping option is required</FormHelperText>
        )}
      </FormControl>

      <TextField
        label='Quantity'
        variant='outlined'
        fullWidth
        margin='normal'
        type='number'
        value={quantity}
        onChange={handleChange('quantity')}
        onBlur={handleBlur('quantity')}
        error={touched.quantity && (quantity === '' || quantity <= 0)}
        helperText={
          touched.quantity && (quantity === '' || quantity <= 0)
            ? 'Quantity must be greater than 0'
            : ''
        }
        required
        inputProps={{ min: 0 }}
      />

      {/* Submit Button */}
      <Button
        type='submit'
        variant='contained'
        color='primary'
        fullWidth
        size='large'
        sx={{ mt: 3 }}
        disabled={!isFormValid || loading} // Disabled until validation passes
      >
        {loading ? <CircularProgress size={24} /> : 'Create Product'}
      </Button>
    </Box>
  );

  return (
    <Layout
      title='Add a new product'
      description={`Hey ${user.name}, ready to add a new product?`}
    >
      <Grid container spacing={2}>
        {/* LEFT SIDEBAR */}
        <AdminSidebar />
  
        {/* MAIN CONTENT */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            <CardHeader
              title='Add New Product'
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
                  width: '100%',
                }}
              >
                {/* Error Banner */}
                {error && (
                  <Alert severity='error' sx={{ width: '100%' }}>
                    {error}
                  </Alert>
                )}

                {/* Success Banner */}
                {createdProduct && (
                  <Alert severity='success' sx={{ width: '100%' }}>
                    <Typography variant='h6'>
                      {`${createdProduct}`} has been created successfully!
                    </Typography>
                  </Alert>
                )}

                {/* Loading Spinner */}
                {loading && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}

                {/* Render the Form */}
                {newPostForm()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default AddProduct;
