import mongoose from "mongoose";

// Schema for addresses
export const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  doorNumber: { type: String, required: true },
  streetName: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  state: { type: String, required: true },
});

// Schema for users
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: { // Add this field for Stripe Customer ID
      type: String,
      required: false, // Optional initially
    },
    addresses: [addressSchema],
    cart: [
      {
        category: { type: String },
        productId: { type: mongoose.Schema.Types.ObjectId },
        addons: [{ type: mongoose.Schema.Types.ObjectId }],
        prevAddons: [{ type: mongoose.Schema.Types.ObjectId }],
        subscription: { type: Boolean, default: false}
      },
    ],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] 
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.model("User", userSchema);
export default User;
