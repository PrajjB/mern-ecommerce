// ==========================================
// core/Product.jsx - Single Product Details Page
// ==========================================
// This page is responsible for showing the detailed view of a single product.
// It also fetches and displays related products based on the product's category.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import { read, listRelated } from './apiCore';
import Card from './Card';

// Material UI Components
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const Product = () => {
  // State for the main product and an array for its related products
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState('');

  // Extract the `productId` parameter from the URL (e.g., /product/12345)
  const { productId } = useParams();

  // ==========================================
  // Fetch Product & Related Products
  // ==========================================
  const loadSingleProduct = (productId) => {
    // 1. Fetch the main product data
    read(productId).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProduct(data);
        setError('');
        
        // 2. Once the main product is loaded, fetch related products using its ID
        listRelated(data._id).then((relatedData) => {
          if (relatedData.error) {
            setError(relatedData.error);
          } else {
            setRelatedProducts(relatedData);
          }
        });
      }
    });
  };

  // Run the fetch function whenever the `productId` in the URL changes
  useEffect(() => {
    loadSingleProduct(productId);
  }, [productId]);

  return (
    // Pass dynamic product name and description to the Layout's Hero Header
    <Layout
      title={product?.name || 'Product'}
      description={product?.description?.substring(0, 100) || ''}
      className='container-fluid'
    >
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Error Handling */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent='center'>
          {/* Main Product Display Area */}
          <Grid item xs={12} md={5}>
            <Typography variant='h4' gutterBottom>
              Product Details
            </Typography>
            {product ? (
              // Use the reusable Card component, but hide the "View Product" button
              // since we are already on the View Product page.
              <Card product={product} showViewProductButton={false} />
            ) : (
              <Typography>Loading product...</Typography>
            )}
          </Grid>

          {/* Related Products Display Area */}
          <Grid item xs={12} md={7}>
            <Typography variant='h5' gutterBottom>
              Related Products
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)', // Max 3 cards wide on desktop
                },
                gap: 3,
              }}
            >
              {/* Map over related products or show empty state */}
              {relatedProducts.length > 0 ? (
                relatedProducts.map((product, i) => (
                  <Card key={i} product={product} />
                ))
              ) : (
                <Typography>No related products found.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Product;
