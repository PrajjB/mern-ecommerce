// ==========================================
// core/Search.jsx - Global Search Component
// ==========================================
// Renders a search bar allowing the user to search products by text and category.
// It also displays the results in a grid directly underneath the search bar.

import React, { useState, useEffect } from 'react';
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getCategories, list } from './apiCore';
import Card from './Card';

const Search = () => {
  // Complex state object for the entire search feature
  const [data, setData] = useState({
    categories: [], // Dropdown options
    category: '', // Currently selected category ID
    search: '', // Text typed in the search bar
    results: [], // Array of fetched products
    searched: false, // Flag to indicate if a search has been executed
  });

  const { categories, category, search, results, searched } = data;

  // ==========================================
  // Initialization: Fetch Categories for Dropdown
  // ==========================================
  const loadCategories = () => {
    getCategories().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        // Merge the new categories into the existing state object
        setData((prevData) => ({ ...prevData, categories: data }));
      }
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================
  // Execute Search Query
  // ==========================================
  const searchData = () => {
    // Only search if the user typed something
    if (search) {
      list({ search: search || undefined, category: category }).then(
        (response) => {
          if (response.error) {
            console.log(response.error);
          } else {
            setData((prevData) => ({
              ...prevData,
              results: response, // Update results array
              searched: true, // Set flag so the search message renders
            }));
          }
        }
      );
    }
  };

  const searchSubmit = (e) => {
    e.preventDefault(); // Prevent standard HTML form submission (page reload)
    searchData();
  };

  // ==========================================
  // Handle Input Changes
  // ==========================================
  // Higher-order function that handles changes for both the category dropdown and the text field
  const handleChange = (name) => (event) => {
    setData((prevData) => ({
      ...prevData,
      [name]: event.target.value,
      searched: false, // Reset the searched flag so the result message disappears while typing
    }));
  };

  // ==========================================
  // Render Search Feedback Message
  // ==========================================
  const searchMessage = (searched, results) => {
    if (searched && results.length > 0) {
      return `Found ${results.length} products`;
    }
    if (searched && results.length < 1) {
      return `No products found`;
    }
    return '';
  };

  // ==========================================
  // Render Search Results Grid
  // ==========================================
  const searchedProducts = (results = []) => {
    return (
      <Box sx={{ mt: 4 }}>
        {searched && (
          <Typography variant='h5' align='center' gutterBottom>
            {searchMessage(searched, results)}
          </Typography>
        )}
        <Grid container spacing={3}>
          {results.map((product, i) => (
            <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
              <Card product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Search Form Wrapper */}
      <Paper
        component='form'
        onSubmit={searchSubmit}
        sx={{
          p: 3,
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          maxWidth: 800,
          mx: 'auto',
          boxShadow: 3, // Material UI shadow depth
        }}
      >
        {/* Category Dropdown */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id='category-select-label'>Category</InputLabel>
          <Select
            labelId='category-select-label'
            id='category-select'
            value={category}
            onChange={handleChange('category')}
            label='Category'
            size='small'
          >
            <MenuItem value='All'>All Categories</MenuItem>
            {categories.map((c, i) => (
              <MenuItem key={i} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Text Search Input */}
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search products...'
          value={search}
          onChange={handleChange('search')}
          size='small'
          InputProps={{
            startAdornment: <SearchIcon color='action' sx={{ mr: 1 }} />,
          }}
          sx={{
            flexGrow: 1,
            maxWidth: 400,
          }}
        />

        {/* Submit Button */}
        <Button
          variant='contained'
          type='submit'
          size='large'
          sx={{
            px: 4,
            height: 40,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Search
        </Button>
      </Paper>

      {/* Render the grid of results underneath the form */}
      {searchedProducts(results)}
    </Container>
  );
};

export default Search;
