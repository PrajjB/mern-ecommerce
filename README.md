# MERN E-Commerce Platform

A full-stack e-commerce web application built using the MERN stack, featuring user authentication, product management, and secure checkout functionality.

## 🚀 Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB

---

## 📦 Features

### User Features

* Browse all products
* View detailed product pages
* Search and filter products by category and price
* Add items to cart and checkout
* User authentication (Sign up / Login)

### Admin Features

* Create, update, and delete products
* Manage product categories
* View and manage orders
* Update order status (Processing, Shipped, Delivered)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mern-ecommerce
```

### 2. Install dependencies

#### Backend

```bash
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
BRAINTREE_MERCHANT_ID=your_id
BRAINTREE_PUBLIC_KEY=your_key
BRAINTREE_PRIVATE_KEY=your_key
```

---

### 4. Frontend Configuration

Update API endpoint in:

```bash
frontend/config.js
```

```javascript
export const API = "http://localhost:5000/api";
```

---

### 5. Run the Application

```bash
npm run dev
```

---

## 🗂 Database Schema Overview

* **Users:** authentication and profile data
* **Products:** product details, pricing, inventory
* **Categories:** product grouping
* **Orders:** transaction and order history

---

## 📌 Notes

* Ensure `.env` is added to `.gitignore`
* Update API URL if deploying backend separately
* Use secure environment variables in production

---

## 💡 Future Improvements

* Payment gateway enhancements
* UI/UX improvements
* Performance optimization
* Deployment and CI/CD integration

---
