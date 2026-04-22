// ==========================================
// core/Shop.jsx - Shop Page with Advanced Filtering
// ==========================================
// The Shop page displays a sidebar with Categories (checkboxes) and Prices (radio buttons).
// It queries the backend via POST request to fetch products that match the selected filters.
// Also implements "Load More" pagination.

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Button from '@mui/material/Button';
import Card from './Card.jsx';
import { getCategories, getFilteredProducts } from './apiCore.js';
import CategoriesFilter from './CategoriesFilter';
import PriceRangeFilter from './PriceRangeFilter';
import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Search from './Search';
import { prices } from './fixedPrices.js';

// Custom Styled Component for the Load More button
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  borderRadius: 3,
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 20px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  },
}));

const Shop = () => {
  // State to track selected filters. Structure: { filters: { category: [ids], price: [min, max] } }
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(false);
  
  // Pagination State
  const [limit, setLimit] = useState(6); // How many products to fetch per request
  const [skip, setSkip] = useState(0); // How many products to skip (used for pagination offset)
  const [size, setSize] = useState(0); // Total number of products returned in the current batch
  const [filteredResults, setFilteredResults] = useState([]); // The actual products to display

  // ==========================================
  // Initialization: Load Categories
  // ==========================================
  const init = () => {
    getCategories().then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setCategories(data); // Populate the categories array for the sidebar
      }
    });
  };

  // ==========================================
  // Fetch Filtered Products
  // ==========================================
  const loadFilteredResults = (newFilters) => {
    // Calls API with current skip (0), limit (6), and selected filters
    getFilteredProducts(skip, limit, newFilters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults(data.data); // Set products array
        setSize(data.size); // Set the size of the returned batch (determines if 'Load More' button shows)
        setSkip(0); // Reset skip to 0 because this is a fresh filter query
      }
    });
  };

  // ==========================================
  // Load More Products Pagination
  // ==========================================
  const loadMore = () => {
    let toSkip = skip + limit; // Calculate new offset (e.g., if we were at 0, now skip first 6)
    
    getFilteredProducts(toSkip, limit, myFilters.filters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        // Spread operator (...) appends new data to the existing filteredResults array
        setFilteredResults([...filteredResults, ...data.data]);
        setSize(data.size);
        setSkip(toSkip); // Update skip state for the next 'Load More' click
      }
    });
  };

  const loadMoreButton = () => {
    // Only show button if size > 0 and size >= limit.
    // If size < limit, it means we've reached the end of the database results.
    return (
      size > 0 &&
      size >= limit && (
        <GradientButton onClick={loadMore} variant='contained'>
          Load more
        </GradientButton>
      )
    );
  };

  useEffect(() => {
    init(); // Load sidebar categories
    loadFilteredResults(skip, limit, myFilters.filters); // Load initial products (no filters applied yet)
  }, []);

  // ==========================================
  // Handle Filter Changes from Sidebar
  // ==========================================
  /**
   * @param {Array} filters - The new array of selected values (e.g., [category_id_1, category_id_2] or price radio id)
   * @param {String} filterBy - Specifies which filter changed: 'category' or 'price'
   */
  const handleFilters = (filters, filterBy) => {
    const newFilters = { ...myFilters }; // Copy current state
    newFilters.filters[filterBy] = filters; // Update the specific filter category

    // If the price filter changed, we need to convert the Radio button ID (0, 1, 2) 
    // into an actual array of prices (e.g., [0, 9] or [10, 19]) using handlePrice
    if (filterBy === 'price') {
      let priceValues = handlePrice(filters);
      newFilters.filters[filterBy] = priceValues;
    }
    
    // Fetch new results based on the updated filters
    loadFilteredResults(myFilters.filters);
    setMyFilters(newFilters); // Update state
  };

  // Maps the selected Radio Button ID to the actual min/max price array
  const handlePrice = (value) => {
    const data = prices; // Imported from fixedPrices.js
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value)) {
        array = data[key].array; // e.g., returns [20, 39]
      }
    }
    return array;
  };

  return (
    <Layout
      title='Shop page'
      description='Search and find books'
      className='container-fluid'
    >
      <Search />
      <Grid container spacing={2}>
        {/* LEFT SIDEBAR: Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <CategoriesFilter
            categories={categories}
            // Passes a callback so the child component can send data back up to the parent
            handleFilters={(filters) => handleFilters(filters, 'category')}
          />
          <PriceRangeFilter
            prices={prices}
            handleFilters={(filters) => handleFilters(filters, 'price')}
          />
        </Grid>
        
        {/* RIGHT MAIN AREA: Products */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant='h4' gutterBottom>
            Products
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
              mb: 4,
            }}
          >
            {filteredResults.map((product, i) => (
              <Grid item key={i} xs={6} md={4}>
                <Card product={product} />
              </Grid>
            ))}
          </Box>
          <hr />
          {loadMoreButton()}
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Shop;
