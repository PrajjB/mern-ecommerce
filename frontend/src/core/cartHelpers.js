// ==========================================
// core/cartHelpers.js - LocalStorage Cart Management
// ==========================================
// This utility file handles all operations related to the shopping cart.
// Instead of storing the cart in a database immediately, we store it in the browser's 
// `localStorage` so the user doesn't lose their cart if they refresh or close the tab.

// ==========================================
// Add Item to Cart
// ==========================================
export const addItem = (item = [], count = 0, next = (f) => f) => {
  let cart = [];
  // Ensure we are running in the browser (Next.js/SSR safety check)
  if (typeof window !== 'undefined') {
    // 1. Check if a cart already exists in localStorage
    if (localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }
    
    // 2. Add the new item to the cart array with a default count of 1
    cart.push({
      ...item,
      count: 1,
    });

    // 3. Remove duplicates from the cart.
    // If a user clicks "Add to Cart" multiple times for the same product, 
    // we don't want multiple identical entries in the array.
    
    // Step A: Extract just the IDs of the products: `cart.map((p) => p._id)`
    // Step B: Pass that array to `new Set()` which automatically removes duplicate IDs.
    // Step C: Convert the Set back into an Array: `Array.from(...)`
    // Step D: Map over these unique IDs and find the full product object from the original cart array.
    cart = Array.from(new Set(cart.map((p) => p._id))).map((id) => {
      return cart.find((p) => p._id === id);
    });

    // 4. Save the updated, duplicate-free array back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // 5. Execute callback (usually to trigger a UI update or redirect)
    next();
  }
};

// ==========================================
// Get Total Number of Unique Items
// ==========================================
// Used primarily for the "Cart (3)" badge in the navigation bar.
export const itemTotal = () => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cart')) {
      return JSON.parse(localStorage.getItem('cart')).length;
    }
  }
  return 0; // Return 0 if cart is empty or doesn't exist
};

// ==========================================
// Get Cart Contents
// ==========================================
// Used by the Cart and Checkout pages to retrieve the actual array of products.
export const getCart = () => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cart')) {
      return JSON.parse(localStorage.getItem('cart'));
    }
  }
  return [];
};

// ==========================================
// Update Item Quantity
// ==========================================
// Called when a user changes the quantity input field on the Cart page.
export const updateItem = (productId, count) => {
  let cart = [];
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }

    // Find the product by ID and update its `count` property
    cart.map((product, i) => {
      if (product._id === productId) {
        cart[i].count = count;
      }
    });

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

// ==========================================
// Remove Item from Cart
// ==========================================
// Called when a user clicks the "Remove" button on the Cart page.
export const removeItem = (productId) => {
  let cart = [];
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cart')) {
      cart = JSON.parse(localStorage.getItem('cart'));
    }

    // Find the product by ID and remove it from the array using `splice`
    cart.map((product, i) => {
      if (product._id === productId) {
        cart.splice(i, 1);
      }
    });

    // Save the modified cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  return cart; // Return the new cart array so the UI can update immediately
};

// ==========================================
// Empty Entire Cart
// ==========================================
// Called upon successful payment to clear the user's purchased items.
export const emptyCart = (next) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
    next(); // Callback to trigger UI updates (like showing a success message)
  }
};
