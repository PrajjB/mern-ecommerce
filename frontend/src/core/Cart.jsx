// ==========================================
// core/Cart.jsx - Shopping Cart Page
// ==========================================
// Displays the items currently added to the user's cart (saved in LocalStorage).
// Allows users to update quantities, remove items, and proceed to checkout.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { getCart } from './cartHelpers.js';
import Card from './Card.jsx';
import Checkout from './Checkout';

// Material UI Components
import {
  Box,
  Typography,
  Divider,
  Grid,
  Container,
  Button,
  Paper,
  Stack,
} from '@mui/material';

const Cart = () => {
  // State to hold the array of products from LocalStorage
  const [items, setItems] = useState([]);
  
  // `run` is used as a trigger to re-render the cart when an item's quantity 
  // is updated or an item is removed.
  const [run, setRun] = useState(false);

  // Fetch the cart items from LocalStorage on component mount and whenever `run` changes
  useEffect(() => {
    setItems(getCart());
  }, [run]);

  // ==========================================
  // Render Cart Items List
  // ==========================================
  const showItems = (items) => (
    <Stack spacing={3}>
      <Typography variant='h5' textAlign='center' gutterBottom>
        Your Cart ({items.length} {items.length === 1 ? 'Item' : 'Items'})
      </Typography>
      <Divider />
      
      {/* Map through the items array and render a Card for each product */}
      {items.map((product, i) => (
        <Box key={i}>
          {/* Configure the Card component specifically for the Cart view */}
          <Card
            product={product}
            showAddToCartButton={false} // Hide 'Add to Cart' (already in cart)
            cartUpdate={true} // Show the quantity input field
            showRemoveProductButton={true} // Show the 'Remove' button
            setRun={setRun} // Pass the trigger function so Card can force Cart to re-render
            run={run}
          />
        </Box>
      ))}
    </Stack>
  );

  // ==========================================
  // Render Empty Cart Message
  // ==========================================
  const noItemsMessage = () => (
    <Box textAlign='center' py={4}>
      <Typography variant='h5' gutterBottom>
        Your cart is empty
      </Typography>
      <Button
        component={Link}
        to='/shop'
        variant='contained'
        color='primary'
        size='large'
        sx={{ mt: 2 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  return (
    <Layout
      title='Shopping Cart'
      description='Manage your cart items. Add remove checkout or continue shopping.'
    >
      {/* If there are items in the cart, show the Cart grid, else show Empty Message */}
      {items.length > 0 ? (
        <Grid container spacing={2}>
          {/* Left Column: Cart Items */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              {showItems(items)}
            </Paper>
          </Grid>

          {/* Right Column: Order Summary & Checkout Form */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Paper
              elevation={2}
              // Sticky positioning keeps the summary visible while scrolling down the items list
              sx={{ p: 3, position: { md: 'sticky' }, top: { md: 16 } }}
            >
              <Typography variant='h5' textAlign='center' gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {/* Checkout Component handles the Braintree payment integration */}
              <Checkout products={items} setRun={setRun} run={run} />
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // Empty Cart UI
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Paper elevation={2} sx={{ p: 4 }}>
            {noItemsMessage()}
          </Paper>
        </Box>
      )}
    </Layout>
  );
};

export default Cart;
