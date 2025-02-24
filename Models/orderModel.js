// Models/orderModel.js
import mongoose from "mongoose";
import { addressSchema } from "./userModel.js";

// Schema for addons
const addonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

// Schema for orders
const orderSchema = new mongoose.Schema({
  orderNo: { type: Number, unique: true, required: true },
  sessionId: { type: String },
  transactionId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Service",
      },
      category: { type: String, required: true },
      productImg: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      addons: [addonSchema],
      subscription: { type: Boolean, required: true },
      serviceDate: { type: String, required: true },
      lastServiceDate: { type: String },
      serviceTime: { type: String, required: true },
      serviceAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      serviceAddress: addressSchema,
      reviewed: { type: Boolean, default: false },
      reminder: { type: Boolean, default: false },
      status: { type: String, default: "upcoming" },
    },
  ],
  source: { type: String, required: true },
  paymentMode: { type: String, required: true },
  subscription: { type: Boolean },
  status: { type: String },
  receiptUrl: { type: String },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Static method to get the next order number
orderSchema.statics.getNextOrderNo = async function () {
  const lastOrder = await this.findOne().sort({ createdAt: -1 }).limit(1);
  const lastOrderNumber =
    lastOrder && lastOrder.orderNo ? lastOrder.orderNo : 0;
  return lastOrderNumber + 1;
};

// Create the Order model
const Order = mongoose.model("Order", orderSchema);
export default Order;
