// ==========================================
// core/Menu.jsx - Navigation Bar Component
// ==========================================
// This is the global navigation bar (AppBar). It handles routing, displaying the cart item count,
// conditional rendering based on user authentication status (Guest vs User vs Admin), 
// and provides a responsive hamburger menu for mobile devices.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signout, isAuthenticated } from '../auth'; // Auth helpers to check login status and process logout
import { itemTotal } from './cartHelpers'; // Helper to get the total number of items in the cart

// Material UI Components
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Material UI Icons
import {
  ShoppingCart,
  Home,
  Storefront,
  Dashboard,
  AccountCircle,
  PersonAdd,
  ExitToApp,
  Store,
  Menu as MenuIcon,
} from '@mui/icons-material';

const MaterialAppBar = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate the user
  const theme = useTheme();
  // Check if screen size is 'md' (medium/tablet) or smaller
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State to manage the open/close status of the mobile hamburger menu
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
  const currentPath = window.location.pathname;

  const isMobileMenuOpen = Boolean(mobileAnchorEl);

  // Handlers for mobile menu
  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  // ==========================================
  // Signout Handler
  // ==========================================
  const handleSignout = () => {
    // Calls the signout helper (which clears localstorage and makes backend API call)
    signout(() => {
      navigate('/'); // Redirect to home page after successful signout
    });
    handleMobileMenuClose(); // Close mobile menu if it was open
  };

  // Helper to determine if a link is currently active (used for styling)
  const isActive = (path) => currentPath === path;

  // ==========================================
  // Navigation Configuration
  // ==========================================
  // Array defining all possible navigation links. 
  // The 'show' property uses logic to determine if the link should be visible.
  const navItems = [
    { path: '/', label: 'Home', icon: <Home />, show: true },
    { path: '/shop', label: 'Shop', icon: <Storefront />, show: true },
    {
      path: '/cart',
      label: 'Cart',
      icon: (
        // Badge displays the little red circle with the number of items in the cart
        <Badge badgeContent={itemTotal()} color='error'>
          <ShoppingCart />
        </Badge>
      ),
      show: true,
    },
    {
      path: '/user/dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      // Show ONLY if authenticated AND user role is 0 (standard user)
      show: isAuthenticated() && isAuthenticated().user.role === 0,
    },
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      // Show ONLY if authenticated AND user role is 1 (admin)
      show: isAuthenticated() && isAuthenticated().user.role === 1,
    },
    {
      path: '/signin',
      label: 'Sign In',
      icon: <AccountCircle />,
      // Show ONLY if NOT authenticated
      show: !isAuthenticated(),
    },
    {
      path: '/signup',
      label: 'Sign Up',
      icon: <PersonAdd />,
      // Show ONLY if NOT authenticated
      show: !isAuthenticated(),
    },
  ];

  // ==========================================
  // Render Desktop Navigation
  // ==========================================
  const renderDesktopNav = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {navItems.map(
        (item) =>
          item.show && (
            <Button
              key={item.path}
              component={Link} // Use React Router's Link for client-side routing
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: 'white',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                backgroundColor: isActive(item.path)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          )
      )}
      {/* Explicit Sign Out Button for authenticated users */}
      {isAuthenticated() && (
        <Button
          onClick={handleSignout}
          startIcon={<ExitToApp />}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          Sign Out
        </Button>
      )}
    </Box>
  );

  // ==========================================
  // Render Mobile Navigation Menu (Hamburger)
  // ==========================================
  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileAnchorEl}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          width: 250,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        },
      }}
      MenuListProps={{
        sx: {
          padding: 0,
        },
      }}
    >
      {navItems.map(
        (item) =>
          item.show && (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMobileMenuClose}
              sx={{
                backgroundColor: isActive(item.path)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          )
      )}
      {/* Mobile Sign Out Button */}
      {isAuthenticated() && (
        <>
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <MenuItem
            onClick={handleSignout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary='Sign Out' />
          </MenuItem>
        </>
      )}
    </Menu>
  );

  return (
    // The main App Bar wrapper. 'fixed' keeps it at the top of the screen during scrolling.
    <AppBar
      position='fixed'
      elevation={4}
      sx={{ zIndex: theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo / Brand Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='brand'
            component={Link}
            to='/'
            sx={{ mr: 1 }}
          >
            <Store />
          </IconButton>
          <Typography
            variant='h6'
            component={Link}
            to='/'
            sx={{
              fontWeight: 'bold',
              textDecoration: 'none', // Remove underline from link
              color: 'white',
            }}
          >
            BRAND
          </Typography>
        </Box>

        {/* Conditional Rendering: Show Desktop Nav or Mobile Hamburger Icon */}
        {!isMobile ? (
          renderDesktopNav()
        ) : (
          <IconButton
            color='inherit'
            aria-label='open menu'
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Render the mobile menu popover only if on a mobile device */}
      {isMobile && renderMobileMenu()}
    </AppBar>
  );
};

export default MaterialAppBar;
