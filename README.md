# <h1 align='center'>CleanEase API - Backend</h1>

CleanEase API is a backend system for a cleaning service application built using **Node.js**, **Express.js**, and **MongoDB**. This backend provides authentication, service management, cart functionality, payments (via Stripe), and scheduling features.

---

## 🚀 Features

- **🔐 User Authentication:** Register, login, and manage users securely with JWT authentication.  
- **🧹 Service Management:** Add, update, delete, and retrieve cleaning services.  
- **🛒 Cart & Order System:** Users can add services to their cart and place orders.  
- **💳 Payment Integration:** Secure payments via **Stripe Checkout**.  
- **⭐ Reviews & Ratings:** Users can leave reviews for services.  
- **⏳ Scheduled Tasks:** Uses `node-cron` for automated tasks.  
- **🔒 Secure API Routes:** Middleware for authentication and error handling.  
- **🔔 Webhook Handling:** Stripe webhooks for payment confirmation.  

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/Yogadeepan29/CAPSTONE--CleanEase_Backend.git
cd CleanEase-Backend
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Create a `.env` File

Create a `.env` file in the root directory and add the following:

```env
PORT=prefered port
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4️⃣ Start the Server

For development mode with hot-reloading:

```sh
npm run dev
```

For production mode:

```sh
npm start
```

---

## 📂 Project Structure

```
📁 CAPSTONE-CleanEase-(BACKEND)/
├── 📜 .env                         # Environment variables
├── 🚫 .gitignore                   # Files to ignore in version control
├── 📂 Controllers/                 # Contains route controllers
│   ├── 🔑 authController.js
│   ├── 🛒 cartController.js
│   ├── 💳 checkoutController.js
│   ├── 📦 orderController.js
│   ├── 💰 paymentController.js
│   ├── ⭐ reviewController.js
│   ├── 🧹 serviceController.js
│   ├── 👤 userController.js
│   ├── 🔔 webhookController.js
├── 📂 Database/                    # Database configuration
│   ├── ⚙️ config.js
│   ├── 🗄️ services.js
├── 📂 Middleware/                  # Authentication & error handling middleware
│   ├── 🚨 errorMiddleware.js
│   ├── 🔐 verifyToken.js
├── 📂 Models/                      # Mongoose models for MongoDB
│   ├── 🛍️ cartModel.js
│   ├── 🏁 checkoutModel.js
│   ├── 📜 orderModel.js
│   ├── 🌟 reviewModel.js
│   ├── 🏠 servicesModel.js
│   ├── 👤 userModel.js
├── 📦 package-lock.json
├── 📜 package.json                 # Project dependencies
├── 📂 Routers/                     # API routes
│   ├── 🔑 authRouter.js
│   ├── 🛒 cartRouter.js
│   ├── 💳 checkoutRouter.js
│   ├── 📦 orderRouter.js
│   ├── 💰 paymentRouter.js
│   ├── ⭐ reviewRouter.js
│   ├── 🏠 servicesRouter.js
│   ├── 👤 userRouter.js
│   ├── 🔔 webhookRouter.js
├── 🚀 server.js                    # Main entry point
├── 📂 Utils/                       # Utility functions and scheduled tasks
│   ├── ❌ Error.js
│   ├── ⏳ scheduledTasks.js
```

---



## 📌 API Endpoints

### 🔹 🪪 Authentication

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/api/auth/register-user` | Register a new user  |
| POST   | `/api/auth/login-user`    | User login           |
| POST   | `/api/auth/google`        | O-Auth Google Signin |

### 🔹👥 User

| Method | Endpoint                       | Description                         |
| ------ | ------------------------------ | ----------------------------------- |
| PUT    | `/api/user/update/:id`         | Update user information             |
| DELETE | `/api/user/delete/:id`         | Delete user                         |
| POST   | `/api/user/add/address/:id`    | Add user address                    |
| PUT    | `/api/user/update/address/:id` | Update user address                 |
| DELETE | `/api/user/delete/address/:id` | Delete user address                 |
| GET    | `/api/user/total`              | Getting total Number of users count |
| GET    | `/api/user/all`                | Getting all user details            |

### 🔹🧹 Services

| Method | Endpoint                                           | Description                          |
| ------ | -------------------------------------------------- | ------------------------------------ |
| GET    | `/api/services`                                    | Get all services                     |
| POST   | `/api/services`                                    | Add a new service                    |
| GET    | `/api/services/:category/:productName`             | Get service by category and its name |
| GET    | `/api/services/:category/product/:productId`       | Get service by category and its ID   |
| GET    | `/api/services/:categories`                        | Filter Categories                    |
| GET    | `/api/services/:category/:productName/addons/:ids` | Get service Addons by ID             |
| PUT    | `/api/services/product/:id`                        | Update inbuild services by ID        |
| PUT    | `/api/services/product/:id/admin`                  | update admin created services by ID  |
| DELETE | `/api/services/product/:id`                        | Delete created services by ID        |

### 🔹🛒 Cart

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| GET    | `/api/cart`                     | Get user cart              |
| POST   | `/api/cart/add`                 | Add service to cart        |
| DELETE | `/api/cart/remove`              | remove selected cart items |
| DELETE | `/api/cart/remove-multiple`     | remove bunch of cart items |
| PUT    | `/api/cart/update-addons`       | update addon selection     |
| DELETE | `/api/cart/clear`               | clear all items in cart    |
| PUT    | `/api/cart/update-subscription` | update subscription        |

### 🔹📦 Orders

| Method | Endpoint                     | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/api/order/orders`          | Get order details based on user    |
| POST   | `/api/order/toggle-reminder` | Reminder for order                 |
| GET    | `/api/order/total-orders`    | Get total orders and revenue count |
| GET    | `/api/order/all`             | Get all order details              |

### 🔹💰 Payments

| Method | Endpoint                                                | Description                             |
| ------ | ------------------------------------------------------- | --------------------------------------- |
| POST   | `/api/payment/create-checkout-session`                  | Process Stripe payment for one-time     |
| POST   | `/api/payment/create-checkout-session-for-subscription` | Process Stripe payment for subscription |

### 🔹💳 Checkout

| Method | Endpoint                                         | Description                |
| ------ | ------------------------------------------------ | -------------------------- |
| GET    | `/api/checkout/:checkoutId`                      | Retrive checkout data      |
| POST   | `/api/checkout/create-from-checkout/:checkoutId` | Create order from checkout |

### 🔹⭐ Review

| Method | Endpoint                         | Description       |
| ------ | -------------------------------- | ----------------- |
| POST   | `/api/review`                    | Create review     |
| GET    | `/api/review`                    | Get all reviews   |
| GET    | `/api/review/total`              | Get total reviews |
| GET    | `/api/review/:productId`         | Get review by ID  |
| PATCH  | `/api/review/:respond/:reviewId` | Respond to review |

### 🔹🔔 Webhook

| Method | Endpoint       | Description            |
| ------ | -------------- | ---------------------- |
| POST   | `/api/webhook` | Handle Stripe webhooks |

---

## 🛠 Technologies Used

- **Node.js & Express.js** - Backend Framework
- **MongoDB & Mongoose** - Database & ODM
- **JWT & bcrypt.js** - Authentication & Security
- **Stripe** - Payment Processing
- **Node-cron** - Task Scheduling
- **dotenv** - Environment Variables
- **cookie-parser** - Cookie Handling
- **CORS** - Cross-Origin Requests

---

## 🔒 Security Best Practices

- All sensitive data is stored in `.env`.
- JWT authentication is implemented for protected routes.
- Stripe payment processing is securely integrated.
- Middleware for error handling and token verification.

---

## 👨‍💻 Author

**Yogadeepan R**

---

## 🎯 Deployment
- **Frontend:** Deployed on Netlify → [Live Demo](https://ryd-cleanease.netlify.app/)
- **Backend:** Deployed on Render → [API](https://capstone-cleanease-backend.onrender.com)


## 📜 API Documentation

For detailed API documentation, please visit the following link: [API Documentation](https://documenter.getpostman.com/view/35158032/2sAYdoG8Kq)
