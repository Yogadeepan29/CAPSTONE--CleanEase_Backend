// models/Service.js
import mongoose from "mongoose";

// Schema for services
const serviceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      stripePriceId: {
        type: String,
        required: false,
      },
      stripeProductId: {
        type: String,
        required: false,
      },
      subscription: {
        type: Boolean,
        required: true,
        default: false,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      features: [
        {
          type: String,
        },
      ],
      duration: {
        type: String,
        required: true,
      },
      idealFor: {
        type: String,
        required: true,
      },
      productImg: {
        type: String,
        required: true,
      },
      addedBy: {
        type: String,
        required: false,
        default: "Admin",
      },
      rating: {
        type: Number,
        default: 0,
      },
      reviews: {
        type: Number,
        default: 0,
      },
      reviewIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Review",
        default: [],
      },
      bestseller: {
        type: Boolean,
        default: false,
      },
      addons: [
        {
          name: {
            type: String,
          },
          price: {
            type: Number,
          },
          description: {
            type: String,
          },
        },
      ],
    },
  ],
});

// Create the Service model
const Service = mongoose.model("Service", serviceSchema);
export default Service;
