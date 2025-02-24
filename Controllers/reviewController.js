import Order from "../Models/orderModel.js";
import Review from "../Models/reviewModel.js";
import Service from "../Models/servicesModel.js";
import User from "../Models/userModel.js";

// Updates the service rating and review count based on reviews.
export const updateServiceRatingAndReviewCount = async (
  category,
  productId
) => {
  try {
    // Get all reviews for the specific service product
    const reviews = await Review.find({ category, productId });

    // Calculate the total rating
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);

    // Calculate the average rating and format it to one decimal place
    const averageRating =
      reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // Update the service product with the new rating and review count
    await Service.updateOne(
      { "products._id": productId },
      {
        $set: {
          "products.$.rating": parseFloat(averageRating), // Convert back to float
          "products.$.reviews": reviews.length,
        },
      }
    );
  } catch (error) {
    console.error("Error updating service rating and review count:", error);
  }
};

// Creates a new review for a service.
export const createReview = async (req, res) => {
  const { category, productId, rating, feedback, itemId } = req.body;
  const userId = req.user.id;

  try {
    // Create a new review
    const newReview = new Review({
      category,
      productId,
      userId,
      rating,
      feedback,
    });

    // Save the new review to the database
    await newReview.save();

    // Update the service with the new review ID
    await Service.findOneAndUpdate(
      { "products._id": productId },
      {
        $push: { "products.$.reviewIds": newReview._id },
      }
    );

    // Update the specific item in the order that matches the itemId
    await Order.updateOne(
      { "items._id": itemId, userId: req.user.id },
      { $set: { "items.$.reviewed": true } }
    );

    // Update the service rating and review count
    await updateServiceRatingAndReviewCount(category, productId);

    // Respond with success
    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully." });
  } catch (error) {
    // Handle errors
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieves the total number of reviews for admin users.
export const getTotalReviews = async (req, res) => {
  try {
    // Check if the user is an admin
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    // Get total reviews across all reviews
    const totalReviews = await Review.countDocuments();
    res.status(200).json({ totalReviews });
  } catch (error) {
    console.error("Error fetching total reviews:", error);
    res.status(500).json({ error: error.message });
  }
};

// Retrieves reviews for a specific service by its ID.
export const getReviewsByProductId = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).populate("userId", "username profilePicture");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Responds to a specific review (Admin only)
export const respondToReview = async (req, res) => {
  const { reviewId } = req.params;
  const { response } = req.body;

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { response },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res
      .status(200)
      .json({ message: "Response added successfully", updatedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Retrieves all reviews from the database (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews
    const reviews = await Review.find().populate("userId", "username"); // Populate userId to get username

    // Map through the reviews to find the corresponding product name
    const populatedReviews = await Promise.all(
      reviews.map(async (review) => {
        // Find the service document by category
        const service = await Service.findOne({ category: review.category });

        // If the service is found, find the product in the products array
        let productName = "Unknown Product";
        if (service) {
          const product = service.products.find(
            (p) => p._id.toString() === review.productId.toString()
          );
          if (product) {
            productName = product.name; // Get the product name
          }
        }

        return {
          ...review._doc,
          productName, // Add product name to the review object
        };
      })
    );

    res.status(200).json(populatedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
