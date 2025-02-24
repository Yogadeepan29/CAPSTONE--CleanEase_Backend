import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/config.js";
import authRoute from "./Routers/authRouter.js";
import userRoute from "./Routers/userRouter.js";
import cartRoute from "./Routers/cartRouter.js";
import orderRoute from "./Routers/orderRouter.js";
import servicesRoute from "./Routers/servicesRouter.js";
import paymentRoute from "./Routers/paymentRouter.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./Middleware/errorMiddleware.js";
import checkoutRouter from "./Routers/checkoutRouter.js";
import webhookRoute from './Routers/webhookRouter.js';
import reviewRoute from './Routers/reviewRouter.js'
import './Utils/scheduledTasks.js';

dotenv.config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Middleware to handle raw body for Stripe webhooks
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoute); // Correctly set up the webhook route
app.use(cookieParser());
app.use(express.json());




//Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// API Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Api");
});
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/services", servicesRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use('/api/checkout', checkoutRouter);
app.use("/api/review", reviewRoute);

app.use(errorMiddleware);

// Connect to MongoDB

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`server is running `);
});
