import Checkout from "../Models/checkoutModel.js";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";

// Saves checkout data before payment
export const saveCheckoutData = async (req, res) => {
  const { checkoutData } = req.body;

  try {
    const newCheckout = new Checkout({
      userId: req.user.id,
      checkoutData,
    });

    await newCheckout.save();
    res
      .status(200)
      .json({ message: "Checkout data saved", id: newCheckout._id });
  } catch (error) {
    console.error("Error saving checkout data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Retrieves checkout data after payment.
export const getCheckoutData = async (req, res) => {
  const { checkoutId } = req.params;

  try {
    const checkoutData = await Checkout.findById(checkoutId);
    if (!checkoutData) {
      return res.status(404).json({ error: "Checkout data not found" });
    }

    res.status(200).json(checkoutData);
  } catch (error) {
    console.error("Error retrieving checkout data:", error);
    res.status(500).json({ error: error.message });
  }
};

// Creates an order from the retrived checkout data.
export const createOrderFromCheckoutData = async (req, res) => {
  const { checkoutId } = req.params; // Assuming you pass the checkoutId as a URL parameter

  try {
    // Fetch the checkout data using the checkoutId
    const checkoutData = await Checkout.findById(checkoutId);
    if (!checkoutData) {
      return res.status(404).json({ error: "Checkout data not found" });
    }

    // Extract relevant data from checkoutData
    const { items, totalPrice, source } = checkoutData.checkoutData;

    // Fetch the user to get the username
    const user = await User.findById(checkoutData.userId);
    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    // Check for existing order
    const existingOrder = await Order.findOne({
      sessionId: checkoutData.sessionId,
    });
    if (existingOrder) {
      return res.status(200).json(existingOrder); // Return the existing order
    }
    // Get the next order number
    const nextOrderNo = await Order.getNextOrderNo();

    // Create an order using the extracted data
    const newOrder = new Order({
      orderNo: nextOrderNo,
      sessionId: checkoutData.sessionId,
      transactionId: checkoutId,
      userId: checkoutData.userId,
      username: user.username,
      items: items.map((item) => ({
        category: item.productDetail.category,
        productId: item.productDetail._id,
        name: item.productDetail.name,
        productImg: item.productDetail.productImg,
        price: item.subtotal,
        addons: item.addons,
        subscription: item.subscription,
        serviceDate: item.date,
        serviceTime: item.time,
        serviceAddressId: item.selectedAddressId,
        serviceAddress: item.selectedAddress,
        quantity: 1,
      })),
      source: source,
      subscription: checkoutData.subscription,
      paymentMode: "Online",
      receiptUrl: checkoutData.receiptUrl,
      totalAmount: totalPrice,
    });

    // Save the order
    await newOrder.save();

    // update the user with the new order ID
    await User.findByIdAndUpdate(checkoutData.userId, {
      $push: { orders: newOrder._id },
    });

    // Return the created order
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};
