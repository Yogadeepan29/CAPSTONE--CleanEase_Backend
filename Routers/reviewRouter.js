import express from "express";
import {
  createReview,
  getTotalReviews,
  getReviewsByProductId,
  respondToReview,
  getAllReviews,
} from "../Controllers/reviewController.js";
import { verifyToken } from "../Middleware/verifyToken.js";

const router = express.Router();

// Route to create a new review
router.post("/", verifyToken, createReview);

// Route to get all reviews
router.get("/", verifyToken, getAllReviews);

// Route to get total reviews for admin users
router.get("/total", verifyToken, getTotalReviews);

// Route to get reviews by product ID
router.get("/:productId", getReviewsByProductId);

// Route to respond to a specific review
router.patch("/respond/:reviewId", verifyToken, respondToReview);

export default router;
