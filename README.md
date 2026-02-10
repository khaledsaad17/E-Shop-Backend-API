# 🛒 E-Shop Backend API

A fully-featured **E-Commerce Backend REST API** built with **NestJS**.  
This project provides authentication, product management, cart, orders, and user profile functionality for an e-commerce frontend application.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login (JWT)
- Access token & refresh token flow
- Google OAuth authentication
- Forgot / reset password via email
- Secure logout
- Get current authenticated user

### 📦 Products
- Get all products with pagination & filters
- Search products by name or description
- Get product details
- Get available product categories

### 🛒 Cart
- Add items to cart
- Update item quantity
- Remove item from cart
- Clear cart
- Cart is linked to authenticated user

### 📋 Orders
- Create order from cart
- Get user orders history
- Get order details
- Cart is cleared automatically after order creation

### 👤 User Profile
- View profile
- Update profile info
- Change password securely

---

## 🧰 Tech Stack

- **Node.js**
- **NestJS**
- **TypeScript**
- **JWT Authentication**
- **Passport.js**
- **MongoDB**
- **Mongoose**
- **Bcrypt**
- **Nodemailer**

---

## 🗂️ Project Structure

```txt
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── guards/
├── users/
├── products/
├── cart/
├── orders/
└── main.ts
