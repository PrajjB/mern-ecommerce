// ==========================================
// core/ShowImage.jsx - Reusable Image Component
// ==========================================
// Fetches and displays an image directly from the backend API.
// Because images are stored as binary data in MongoDB, they cannot be served as static files.
// Instead, this component sets the `src` attribute to a specific API endpoint which 
// streams the binary image data back to the browser based on the product's ID.

import React from 'react';
import { API } from '../config';

const ShowImage = ({ item, url }) => (
  // Container enforcing a fixed height to keep product cards uniform
  <div className='product-img' style={{height: '250px'}}>
    <img
      // Constructs the URL: e.g., http://localhost:8000/api/product/photo/5f8d...
      src={`${API}/${url}/photo/${item._id}`}
      alt={item.name}
      className='mb-3'
      // objectFit: 'contain' ensures the image scales correctly without being stretched or cropped
      style={{ objectFit: 'contain', height: '100%', width: '100%', display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}
    />
  </div>
);

export default ShowImage;
