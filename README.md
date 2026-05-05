# 🛍️ Professional E-Commerce Backend API

A robust, production-ready RESTful API for an E-Commerce platform. Built with **Node.js**, **Express**, and **Sequelize**, this API features advanced security, automated checkout flows, and a custom testing environment.

---

## 🚀 Core Features

### 👤 User Authentication
*   **Secure Registration & Login**: Uses **Bcrypt** for password hashing and **JWT (JSON Web Tokens)** for stateless authentication.
*   **Profile Management**: Supports profile image uploads directly to **Supabase Storage**.

### 📦 Product Management
*   **Full CRUD**: Create, Read, Update, and Delete products.
*   **Advanced Catalog**: Built-in **Search** functionality and **Pagination** for high-performance product browsing.
*   **Soft Deletion Safety**: Intelligent handling of product deletions that automatically cleans up active carts.

### 🛒 Shopping Cart System
*   **Persistent Carts**: Items are stored in the database, allowing users to access their cart from any device.
*   **Inventory Validation**: Automatically checks stock levels before adding items to the cart.

### 💳 Stripe Payment Integration
*   **Smart Checkout**: One-click checkout that automatically pulls items, quantities, and prices from the user's cart.
*   **Secure Webhooks**: Handles Stripe events (like successful payments) to automate order fulfillment and cart clearing.

---

## 🛡️ Security Architecture

This API is hardened with industry-standard security practices:

*   **HTTP Security Headers**: Integrated with **Helmet.js** to protect against XSS, Clickjacking, and MIME-sniffing.
*   **Multi-Tier Rate Limiting**:
    *   *Global Limiter*: Prevents DDoS and brute-force scraping.
    *   *Auth Limiter*: Strict limits on login/signup routes to stop credential stuffing.
*   **Data Validation**: Powered by **Zod** for strict schema validation of all incoming requests.
*   **SQL Injection Protection**: Leverages **Sequelize's** parameterized queries to eliminate SQL injection risks.
*   **CORS**: Configured to allow secure cross-origin communication.

---

## 🛠️ Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js (v5.2+)
*   **Database**: PostgreSQL via **Supabase**
*   **ORM**: Sequelize
*   **Validation**: Zod
*   **Payments**: Stripe API
*   **File Storage**: Supabase Storage
*   **Security**: Helmet, Express-Rate-Limit, Bcrypt, JWT

---

## 🕹️ Testing Dashboard

Included in the repository is a **Premium API Test Dashboard** (`api-test-dashboard.html`). This browser-based tool allows you to:
*   Test all endpoints with a beautiful UI.
*   Automatically handle Bearer Tokens (Login once, test everything).
*   Auto-fill IDs for products and carts to speed up testing.

---

## 📥 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Ryan7557/E-Commerce-roadmap.sh-backend-API-.git
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file and add your credentials (JWT Secret, Supabase URL, Stripe Keys).
4.  **Run in Development**:
    ```bash
    npm run dev
    ```

---

## 🚢 Deployment

The project is pre-configured for **Render** or **Railway**. 
*   **Entry Point**: `app.js`
*   **Build Command**: `npm install`
*   **Start Command**: `node app.js`

---

*Developed as part of the Roadmap.sh backend challenge, enhanced with premium security and architecture.*
