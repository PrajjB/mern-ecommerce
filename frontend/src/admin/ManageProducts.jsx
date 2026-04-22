// ==========================================
// admin/ManageProducts.jsx - Product Management Dashboard
// ==========================================
// Provides a list view of all products in the database for the Admin.
// Allows the Admin to easily Edit or Delete specific products.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar';
import { isAuthenticated } from '../auth'; // Helper for JWT
import { getProducts, deleteProduct } from './apiAdmin'; // API calls for CRUD

const ManageProducts = () => {
  // State to hold the array of all products fetched from the backend
  const [products, setProducts] = useState([]);
  
  // Destructure admin's User ID and JWT Token for protected API routes
  const { user, token } = isAuthenticated();

  // ==========================================
  // Fetch All Products
  // ==========================================
  const loadProducts = () => {
    // Gets all products without pagination or filters
    getProducts().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setProducts(data);
      }
    });
  };

  // ==========================================
  // Delete Product Handler
  // ==========================================
  const destroy = (productId) => {
    // Sends DELETE request to the API
    deleteProduct(productId, user._id, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        // If deletion is successful, reload the products list from the database
        // to reflect the updated state.
        loadProducts();
      }
    });
  };

  // Run loadProducts once when the component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Layout
      title='Manage Products'
      description={`Hey ${user.name}, you can manage all the products here`}
    >
      <Grid container spacing={2}>
        {/* LEFT SIDEBAR: Standard Admin Navigation */}
        <AdminSidebar />

        {/* MAIN CONTENT: Products List */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            {/* Header showing total count */}
            <CardHeader
              title={`Total Products: ${products.length}`}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <CardContent>
              {/* Empty State */}
              {products.length === 0 ? (
                <Typography variant='body1' color='text.secondary'>
                  No products found.
                </Typography>
              ) : (
                // Populated List
                <List>
                  {/* Map through the products array and render a list item for each */}
                  {products.map((p, i) => (
                    <React.Fragment key={p._id}>
                      <ListItem
                        // Action buttons rendered on the right side of the list item
                        secondaryAction={
                          <>
                            {/* Edit Button: Links to a separate update page */}
                            <Tooltip title='Edit'>
                              <IconButton
                                component={Link}
                                to={`/admin/product/update/${p._id}`}
                                color='primary'
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Delete Button: Triggers the destroy function */}
                            <Tooltip title='Delete'>
                              <IconButton
                                color='error'
                                onClick={() => destroy(p._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        }
                      >
                        {/* Display the product name */}
                        <ListItemText
                          primary={p.name}
                          primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                      </ListItem>
                      
                      {/* Add a divider between items, except for the last item */}
                      {i < products.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ManageProducts;
