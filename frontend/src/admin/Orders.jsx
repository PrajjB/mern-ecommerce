// ==========================================
// admin/Orders.jsx - Order Management System
// ==========================================
// Allows Administrators to view all customer orders across the platform.
// Admins can see the details of the products ordered, delivery address, and transaction IDs.
// Most importantly, Admins can update the Status of the order (e.g., 'Not processed' -> 'Shipped').

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import moment from 'moment'; // For formatting timestamps into human-readable strings
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar';
import { isAuthenticated } from '../auth'; // Get admin credentials
import { listOrders, getStatusValues, updateOrderStatus } from './apiAdmin'; // API helpers

const Orders = () => {
  // State to hold the array of full order objects
  const [orders, setOrders] = useState([]);
  
  // State to hold the possible Enum values for order status (defined in the backend model)
  const [statusValues, setStatusValues] = useState([]);
  
  const { user, token } = isAuthenticated();

  // ==========================================
  // Fetch Orders
  // ==========================================
  const loadOrders = () => {
    // Fetches all orders from the database, populated with user information
    listOrders(user._id, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setOrders(data);
      }
    });
  };

  // ==========================================
  // Fetch Allowed Status Values
  // ==========================================
  const loadStatusValues = () => {
    // Queries the backend for the allowed Enum values for the `status` field in the Order schema
    // e.g., ['Not processed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    getStatusValues(user._id, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setStatusValues(data); // Populate the dropdown options
      }
    });
  };

  useEffect(() => {
    loadOrders();
    loadStatusValues();
  }, []);

  // ==========================================
  // Handle Status Change
  // ==========================================
  const handleStatusChange = (e, orderId) => {
    // Sends a request to update the status of a specific order
    updateOrderStatus(user._id, token, orderId, e.target.value).then((data) => {
      if (data.error) {
        console.log('Status update failed');
      } else {
        // If successful, reload the orders to reflect the new state in the UI
        loadOrders();
      }
    });
  };

  // Helper to render the header text showing total orders
  const showOrdersLength = () =>
    orders.length > 0 ? (
      <Typography variant='h5' color='primary' sx={{ mb: 2 }}>
        Total Orders: {orders.length}
      </Typography>
    ) : (
      <Typography variant='h6' color='error' sx={{ mb: 2 }}>
        No orders
      </Typography>
    );

  return (
    <Layout
      title='Orders'
      description={`Hey ${user.name}, you can manage all the orders here`}
    >
      <Grid container spacing={2}>
        {/* LEFT SIDEBAR: Standard Admin Navigation */}
        <AdminSidebar />

        {/* MAIN CONTENT: Orders List */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            <CardHeader title='Orders' />
            <Divider />
            <CardContent>
              {showOrdersLength()}
              
              {/* Map through all orders and render a complex card for each one */}
              {orders.map((o) => (
                <Card
                  key={o._id}
                  variant='outlined'
                  sx={{ mb: 3, borderColor: 'primary.light' }} // Highlight order card borders
                >
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Order ID: {o._id}
                    </Typography>

                    {/* Status Update Dropdown */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id={`status-label-${o._id}`}>
                        Status
                      </InputLabel>
                      <Select
                        labelId={`status-label-${o._id}`}
                        value={o.status} // Controlled by the order's current status
                        onChange={(e) => handleStatusChange(e, o._id)}
                      >
                        {/* Map over the allowed Enum values to create the dropdown options */}
                        {statusValues.map((status, index) => (
                          <MenuItem key={index} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Order Metadata Grid (Split into two columns) */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body1'>
                          <strong>Transaction ID:</strong> {o.transaction_id}
                        </Typography>
                        <Typography variant='body1'>
                          <strong>Amount:</strong> ${o.amount}
                        </Typography>
                        <Typography variant='body1'>
                          <strong>Ordered by:</strong> {o.user.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body1'>
                          <strong>Ordered on:</strong>{' '}
                          {moment(o.createdAt).fromNow()}
                        </Typography>
                        <Typography variant='body1'>
                          <strong>Delivery address:</strong> {o.address}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Products List for this Order */}
                    <Typography
                      variant='subtitle1'
                      sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}
                    >
                      Total products in the order: {o.products.length}
                    </Typography>

                    {/* Map through the products inside the current order */}
                    {o.products.map((p, idx) => (
                      <Card
                        key={idx}
                        variant='outlined'
                        sx={{ mb: 2, bgcolor: 'grey.50' }}
                      >
                        <CardContent>
                          {/* Read-only TextFields used for clean display of product data */}
                          <TextField
                            label='Product Name'
                            value={p.name}
                            fullWidth
                            margin='dense'
                            InputProps={{ readOnly: true }}
                          />
                          <TextField
                            label='Product Price'
                            value={p.price}
                            fullWidth
                            margin='dense'
                            InputProps={{ readOnly: true }}
                          />
                          <TextField
                            label='Quantity Ordered'
                            value={p.count}
                            fullWidth
                            margin='dense'
                            InputProps={{ readOnly: true }}
                          />
                          <TextField
                            label='Product ID'
                            value={p._id}
                            fullWidth
                            margin='dense'
                            InputProps={{ readOnly: true }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Orders;
