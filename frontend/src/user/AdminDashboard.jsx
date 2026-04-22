// ==========================================
// user/AdminDashboard.jsx - Admin Control Center
// ==========================================
// This page acts as the main hub for Administrators.
// It displays the admin's profile and includes a sidebar with links to perform
// administrative tasks (Create Categories, Create Products, Manage Orders, etc.).

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import {
  Category as CategoryIcon,
  AddCircle as AddCircleIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar'; // Contains all the admin specific routing links
import { isAuthenticated } from '../auth'; // Helper to fetch JWT data from localStorage

const AdminDashboard = () => {
  // Extract the admin's details from the JWT payload stored in localStorage
  const {
    user: { _id, name, email, role },
  } = isAuthenticated();

  return (
    <Layout title='Admin Dashboard' description={`Welcome, ${name}`}>
      <Grid container spacing={2}>
        {/* ========================================== */}
        {/* LEFT SIDEBAR: Admin Navigation Menu */}
        {/* ========================================== */}
        {/* Reusable component containing links to AddProduct, ManageOrders, etc. */}
        <AdminSidebar />

        {/* ========================================== */}
        {/* RIGHT MAIN CONTENT: Admin Profile Card */}
        {/* ========================================== */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            <CardHeader
              title='Admin Profile'
              sx={{
                bgcolor: 'background.paper',
              }}
            />
            <Divider />
            <CardContent>
              {/* Header Section: Avatar and Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 3,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {/* Extract the first letter of the admin's name for the avatar */}
                  {name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h5' component='div'>
                    {name}
                  </Typography>
                  <Chip
                    // Visual confirmation that this is an Admin account (role 1)
                    label={role === 1 ? 'Administrator' : 'Registered User'}
                    color='primary'
                    size='small'
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              {/* Details Section: ID and Email */}
              <Paper elevation={0} sx={{ bgcolor: 'background.default' }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PersonIcon color='primary' />
                    </ListItemIcon>
                    <ListItemText primary='User ID' secondary={_id} />
                  </ListItem>
                  <Divider component='li' />
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <EmailIcon color='primary' />
                    </ListItemIcon>
                    <ListItemText primary='Email' secondary={email} />
                  </ListItem>
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default AdminDashboard;
