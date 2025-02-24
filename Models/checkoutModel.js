// Models/checkoutModel.js
import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkoutData: { type: Object, required: true },
  sessionId: { type: String }, 
  subscription: { type: Boolean, default: false }, 
  receiptUrl: { type: String }, 
  createdAt: { type: Date, default: Date.now, expires: '10m' } 
});

// Create the Checkout model
const Checkout = mongoose.model('Checkout', checkoutSchema);
export default Checkout;