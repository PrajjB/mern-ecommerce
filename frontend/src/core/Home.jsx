// ==========================================
// core/Home.jsx - Landing Page Component
// ==========================================
// The main landing page of the application. It fetches and displays two rows of products:
// 1. New Arrivals (sorted by creation date)
// 2. Best Sellers (sorted by amount sold)

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts } from './apiCore.js';
import Card from './Card.jsx';
import Search from './Search';
import { Box, Container, Typography } from '@mui/material';

const Home = () => {
  // State to hold the arrays of products fetched from the backend
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [error, setError] = useState([]);

  // ==========================================
  // Fetch Best Sellers
  // ==========================================
  const loadProductsBySell = () => {
    // Calls the API helper requesting products sorted by the 'sold' field
    getProducts('sold').then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductsBySell(data); // Update state with the fetched data
      }
    });
  };

  // ==========================================
  // Fetch New Arrivals
  // ==========================================
  const loadProductsByArrival = () => {
    // Calls the API helper requesting products sorted by the 'createdAt' field
    getProducts('createdAt').then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProductsByArrival(data); // Update state with the fetched data
      }
    });
  };

  // ==========================================
  // Initialization Hook
  // ==========================================
  // useEffect runs when the component mounts. 
  // The empty dependency array [] ensures it only runs once.
  useEffect(() => {
    loadProductsByArrival();
    loadProductsBySell();
  }, []);

  return (
    // Wrap the page in the generic Layout component (which provides the Navbar and Header)
    <Layout
      title='Home page'
      description='MERN E-commerce App'
      className='container-fluid'
    >
      {/* Global Search Bar */}
      <Search />
      
      <Container maxWidth='lg'>
        <Box sx={{ my: 4 }}>
          {/* New Arrivals Section */}
          <Typography variant='h4' gutterBottom>
            New Arrivals
          </Typography>
          <Box
            sx={{
              display: 'grid',
              // Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Map over the fetched array and render a Card component for each product */}
            {productsByArrival.map((product, i) => (
              <Card key={i} product={product} />
            ))}
          </Box>

          {/* Best Sellers Section */}
          <Typography variant='h4' gutterBottom>
            Best Sellers
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {productsBySell.map((product, i) => (
              <Card key={i} product={product} />
            ))}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;
