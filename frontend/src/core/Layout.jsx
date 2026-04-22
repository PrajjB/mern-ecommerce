// ==========================================
// core/Layout.jsx - Global Layout Wrapper
// ==========================================
// This component acts as a high-order wrapper for almost all pages in the app.
// It ensures that the Navigation Menu (Navbar) is present and provides a consistent
// Hero Header (Title & Description) before rendering the specific page content (`children`).

import React from 'react';
import Menu from './Menu'; // The navigation bar component
import { Box, Typography, Container } from '@mui/material';

const Layout = ({
  title = 'Title', // Default title if none is provided
  description = 'Description', // Default description if none is provided
  className, // Optional CSS class for the content container
  children, // The specific page content wrapped inside the Layout
}) => (
  <Box>
    {/* Always render the navigation menu at the top */}
    <Menu />
    
    {/* Hero Header Section */}
    <Box
      sx={{
        position: 'relative',
        height: { xs: 300, md: 400 }, // Responsive height based on screen size
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        // Background image with a dark gradient overlay to make text readable
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pt: '64px', // Push content down so it's not hidden behind the fixed navbar
        mb: 4,
      }}
    >
      <Container maxWidth='md'>
        {/* Dynamic Page Title */}
        <Typography
          variant='h2'
          component='h1'
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Adds depth to text
            fontSize: { xs: '2.5rem', md: '3.5rem' },
          }}
        >
          {title}
        </Typography>
        
        {/* Dynamic Page Description */}
        <Typography
          variant='h5'
          component='p'
          sx={{
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          {description}
        </Typography>
      </Container>
    </Box>

    {/* The actual page content is injected here via the `children` prop */}
    <Box className={className} sx={{ p: { xs: 2, md: 3 } }}>
      {children}
    </Box>
  </Box>
);

export default Layout;
