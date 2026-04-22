// ==========================================
// core/Checkout.jsx - Payment Processing Component
// ==========================================
// Handles the integration with Braintree for processing payments.
// 1. Fetches a client token from the backend to initialize the Drop-In UI.
// 2. Collects delivery address and payment details from the user.
// 3. Submits payment nonce to the backend.
// 4. On successful payment, creates an Order in the database and clears the cart.

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';
import {
  getBraintreeClientToken,
  processPayment,
  createOrder,
} from './apiCore';
import { emptyCart } from './cartHelpers';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react'; // Official Braintree React Component

const Checkout = ({ products, setRun = (f) => f, run = undefined }) => {
  // Complex state managing the checkout flow
  const [data, setData] = useState({
    loading: false, // Is a payment currently processing?
    success: false, // Was the payment successful?
    clientToken: null, // The token received from Braintree to initialize the UI
    error: '', // Error messages (e.g., card declined)
    instance: {}, // The Braintree DropIn instance used to request the payment nonce
    address: '', // User's delivery address
  });

  // Extract user details from LocalStorage (if logged in)
  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  // ==========================================
  // Initialize Braintree DropIn
  // ==========================================
  const getToken = (userId, token) => {
    // Fetches the client token from our Node.js backend
    getBraintreeClientToken(userId, token).then((res) => {
      if (res.error) {
        setData((prev) => ({ ...prev, error: res.error }));
      } else {
        setData((prev) => ({ ...prev, clientToken: res.clientToken }));
      }
    });
  };

  useEffect(() => {
    getToken(userId, token);
  }, []);

  // Update address state as user types
  const handleAddress = (event) => {
    setData({ ...data, address: event.target.value });
  };

  // ==========================================
  // Calculate Order Total
  // ==========================================
  const getTotal = () =>
    // Reduce array of products to a single total price: (price * quantity) + ...
    products.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);

  // ==========================================
  // Process Payment & Create Order
  // ==========================================
  const buy = () => {
    setData({ ...data, loading: true });
    let nonce;
    
    // 1. Request the payment method nonce from the Braintree DropIn UI
    data.instance
      .requestPaymentMethod()
      .then((res) => {
        nonce = res.nonce;
        const paymentData = {
          paymentMethodNonce: nonce,
          amount: getTotal(products),
        };

        // 2. Send the nonce and amount to our backend to execute the charge
        processPayment(userId, token, paymentData)
          .then((response) => {
            
            // 3. Prepare order data to save in our database
            const createOrderData = {
              products: products,
              transaction_id: response.transaction.id, // ID returned from Braintree
              amount: response.transaction.amount,
              address: data.address,
            };

            // 4. Save the order in MongoDB
            createOrder(userId, token, createOrderData)
              .then(() => {
                // 5. If order created successfully, empty the cart
                emptyCart(() => {
                  setRun(!run); // Force cart page to re-render (will show empty message)
                  setData({
                    loading: false,
                    success: true, // Triggers success message
                    clientToken: data.clientToken,
                    instance: {},
                    address: '',
                  });
                });
              })
              .catch(() => setData({ ...data, loading: false }));
          })
          .catch(() => setData({ ...data, loading: false }));
      })
      .catch((error) => {
        // Handle errors from the DropIn UI (e.g., user didn't enter a card)
        setData({ ...data, error: error.message });
      });
  };

  // ==========================================
  // Render Checkout UI
  // ==========================================
  const showDropIn = () =>
    data.clientToken !== null &&
    products.length > 0 && (
      <Box sx={{ mt: 2 }}>
        {/* Delivery Address Input */}
        <TextField
          label='Delivery Address'
          placeholder='Type your delivery address...'
          fullWidth
          multiline
          minRows={3}
          value={data.address}
          onChange={handleAddress}
          sx={{ mb: 2 }}
        />

        {/* Braintree Pre-built UI Component */}
        <DropIn
          options={{
            authorization: data.clientToken,
            paypal: { flow: 'vault' }, // Enables PayPal integration
          }}
          // Save the instance to state so we can call `requestPaymentMethod` later
          onInstance={(instance) => (data.instance = instance)}
        />

        {/* Pay Button */}
        <Button
          onClick={buy}
          variant='contained'
          color='success'
          fullWidth
          sx={{ mt: 2 }}
        >
          Pay ${getTotal()}
        </Button>
      </Box>
    );

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Total: ${getTotal()}
      </Typography>

      {/* Loading Spinner during payment processing */}
      {data.loading && (
        <Stack alignItems='center' sx={{ mb: 2 }}>
          <CircularProgress color='error' />
        </Stack>
      )}

      {/* Success Message */}
      {data.success && (
        <Alert severity='success' sx={{ mb: 2 }}>
          🎉 Thanks! Your payment was successful.
        </Alert>
      )}

      {/* Error Message */}
      {data.error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {data.error}
        </Alert>
      )}

      {/* Conditional Rendering: Show Checkout if logged in, else show Sign In button */}
      {isAuthenticated() ? (
        showDropIn()
      ) : (
        <Button
          component={Link}
          to='/signin'
          variant='contained'
          color='primary'
          fullWidth
        >
          Sign in to checkout
        </Button>
      )}
    </Box>
  );
};

export default Checkout;
