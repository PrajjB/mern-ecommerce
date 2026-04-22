// ==========================================
// core/Card.jsx - Reusable Product Card Component
// ==========================================
// Highly dynamic component used to display a single product. 
// Used on the Home page, Shop page, Product page, and Cart page.
// Its behavior changes based on the boolean props passed to it.

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import ShowImage from './ShowImage';
import moment from 'moment'; // Library for formatting dates (e.g., "2 days ago")

// MUI v5 imports
import Button from '@mui/material/Button';
import CardM from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { addItem, updateItem, removeItem } from './cartHelpers';

// MUI Snackbar Alert wrapper
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

// The Card accepts many configuration props to customize its appearance
const Card = ({
  product, // The actual product object
  showViewProductButton = true, // Should it show the "View Product" button?
  showAddToCartButton = true, // Should it show the "Add to Cart" button?
  cartUpdate = false, // Should it show the quantity input field? (True on Cart page)
  showRemoveProductButton = false, // Should it show the "Remove" button? (True on Cart page)
  setRun = (f) => f, // Function to trigger a re-render in the parent component
  run = undefined, // State variable from parent to trigger re-renders
}) => {
  const [redirect, setRedirect] = useState(false);
  const [count, setCount] = useState(product.count); // Quantity selected
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // ==========================================
  // Conditional UI Renderers
  // ==========================================
  
  // Render the "View Product" Button
  const showViewButton = (showViewProductButton) => {
    return (
      showViewProductButton && (
        <Button
          href={`/product/${product._id}`}
          variant='contained'
          color='primary'
          sx={{ mr: 1 }}
        >
          View Product
        </Button>
      )
    );
  };

  // Add Product to Cart LocalStorage
  const addToCart = () => {
    addItem(product, () => {
      setSnackbarMessage(`${product.name} added to cart!`);
      setOpenSnackbar(true); // Show confirmation popup
      setRun(!run); // Trigger a re-render in the parent to update the Navbar cart count
    });
  };

  // Close the popup notification
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Redirect to cart if `redirect` state is true
  const shouldRedirect = (redirect) => {
    if (redirect) {
      return <Navigate to='/cart' />;
    }
  };

  // Render the "Add to Cart" button. Disables if item is out of stock.
  const showAddToCartBtn = (showAddToCartButton) => {
    return (
      showAddToCartButton && (
        <Button
          onClick={addToCart}
          variant='outlined'
          color='secondary'
          startIcon={<ShoppingCartIcon />}
          disabled={product.quantity < 1} // Disabled condition
        >
          Add to cart
        </Button>
      )
    );
  };

  // Renders a green 'In Stock' or red 'Out of Stock' chip
  const showStock = (quantity) => {
    return quantity > 0 ? (
      <Chip label='In Stock' color='success' size='small' sx={{ mb: 1 }} />
    ) : (
      <Chip label='Out of Stock' color='error' size='small' sx={{ mb: 1 }} />
    );
  };

  // Handle changing the quantity inside the Cart page
  const handleChange = (productId) => (event) => {
    setRun(!run); // Trigger parent re-render (update total price)
    // Prevent negative quantities
    setCount(event.target.value < 1 ? 1 : event.target.value);
    
    if (event.target.value >= 1) {
      updateItem(productId, event.target.value); // Update LocalStorage
      setSnackbarMessage('Quantity updated!');
      setOpenSnackbar(true);
    }
  };

  // Render the Quantity input field (only used on the Cart page)
  const showCartUpdateOptions = (cartUpdate) => {
    return (
      cartUpdate && (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Adjust Quantity</InputLabel>
            <TextField
              type='number'
              variant='outlined'
              value={count}
              onChange={handleChange(product._id)}
              sx={{ mt: 1 }}
              inputProps={{ min: 1, max: product.quantity }} // HTML validation
            />
          </FormControl>
        </Box>
      )
    );
  };

  // Render the Delete button (only used on the Cart page)
  const showRemoveButton = (showRemoveProductButton) => {
    return (
      showRemoveProductButton && (
        <Button
          onClick={() => {
            removeItem(product._id); // Remove from LocalStorage
            setRun(!run); // Re-render Cart page
            setSnackbarMessage(`${product.name} removed from cart!`);
            setOpenSnackbar(true);
          }}
          variant='contained'
          color='error'
          startIcon={<DeleteIcon />}
          sx={{ mt: 1, width: '100%' }}
        >
          Remove Product
        </Button>
      )
    );
  };

  return (
    <>
      <CardM
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s', // Smooth hover effect
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 3,
          },
        }}
      >
        {shouldRedirect(redirect)}
        
        {/* Renders the image fetching from the backend API */}
        <ShowImage item={product} url='product' />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant='h6' component='h2' noWrap>
            {product.name}
          </Typography>

          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3, // Limits description to 3 lines with ellipsis
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </Typography>

          <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
            <Typography variant='body1' fontWeight='bold'>
              ${product.price}
            </Typography>
            {showStock(product.quantity)}
          </Stack>

          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mb: 1 }}
          >
            Category: {product.category?.name}
          </Typography>

          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={{ mb: 2 }}
          >
            Added {moment(product.createdAt).fromNow()} {/* "2 days ago" format */}
          </Typography>

          {/* Render Buttons based on props passed by parent */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 'auto',
            }}
          >
            {showViewButton(showViewProductButton)}
            {showAddToCartBtn(showAddToCartButton)}
          </Box>

          {showCartUpdateOptions(cartUpdate)}
          {showRemoveButton(showRemoveProductButton)}
        </CardContent>
      </CardM>

      {/* Pop-up notification for cart actions */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Card;
