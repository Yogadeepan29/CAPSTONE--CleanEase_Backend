// In your orderController.js
import { addMonths, isAfter } from "date-fns";
import Order from "../Models/orderModel.js";
import User from "../Models/userModel.js";


// Creates a new order
export const createOrder = async (req, res) => {
  try {
    const { sessionId, items, totalAmount, source, serviceAddressId, serviceAddress } = req.body; 
    const userId = req.user.id;

    // Fetch the username from the User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Create the order
    const order = new Order({
      sessionId,
      userId,
      username: user.username, 
      items: items.map((item) => ({
        productId: item.productId,
        addons: item.addons.map((addon) => mongoose.Types.ObjectId(addon.id)),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        reviewed: false,
        status: "upcoming",
        serviceAddressId,
        serviceAddress, 
      })),
      totalAmount,
      source,
    });
    await order.save();

    // Update the user with the new order
    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Retrieves all orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "orders",
      populate: {
        path: "items.productId",
        path: "items.addons",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    const currentDate = new Date();
    const updatePromises = user.orders.map(async (order) => {
      let orderUpdated = false; // Flag to check if the order was updated

      order.items.forEach((item) => {
        if (item.serviceDate && item.serviceTime) {
          const serviceDateTime = new Date(
            `${item.serviceDate} ${item.serviceTime}`
          );

          if (isAfter(currentDate, serviceDateTime)) {
            const twoHoursLater = new Date(
              serviceDateTime.getTime() + 2 * 60 * 60 * 1000
            );

            if (isAfter(currentDate, twoHoursLater)) {
              item.status = "Completed";
              if (item.subscription) {
                updateSubscriptionItem(item, serviceDateTime);
              }
              orderUpdated = true; // Mark order as updated
            } else {
              item.status = "On process";
              orderUpdated = true; // Mark order as updated
            }
          } else {
            item.status = "upcoming";
            orderUpdated = true; // Mark order as updated
          }
        }
      });

      // If the order was updated, save it back to the database
      if (orderUpdated) {
        await Order.findByIdAndUpdate(order._id, { items: order.items }, { new: true });
      }
    });

    // Wait for all update promises to resolve
    await Promise.all(updatePromises);

    return res.status(200).json(user.orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Updates subscription items for an order.
const updateSubscriptionItem = (item, serviceDateTime) => {
  item.lastServiceDate = item.serviceDate;
  const nextServiceDate = addMonths(serviceDateTime, 1);
  item.serviceDate = nextServiceDate.toISOString().split("T")[0];
  item.status = "upcoming";
  item.reviewed = false;
};

// Toggles the reminder status for a specific item in an order
export const toggleReminder = async (req, res) => {
  const { orderId, itemId } = req.body; 
  console.log("Received orderId:", orderId, "itemId:", itemId); 

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Toggle the reminder field
    item.reminder = !item.reminder;
    await order.save();

    return res.status(200).json({ message: "Reminder updated", reminder: item.reminder });
  } catch (error) {
    console.error("Error toggling reminder:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Retrieves total orders and revenue for admin users.
export const getTotalOrdersAndRevenue = async (req, res) => {
  try {
    // Check if the user is an admin
    const userId = req.user.id; 
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Get total orders across all users
    const totalOrders = await Order.countDocuments();


    // Calculate total revenue across all users
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Count total ordered services, pending orders, and subscription services
    const orders = await Order.find().select("items"); // Fetch all orders and only the items field
    let totalOrderedServices = 0;
    let upcomingOrdersCount = 0;
    let subscriptionCount = 0; 
    let completedOrdersCount = 0;

    orders.forEach(order => {
      totalOrderedServices += order.items.length; 
      upcomingOrdersCount += order.items.filter(item => item.status === "upcoming").length; 
      subscriptionCount += order.items.filter(item => item.subscription === true).length; 
      completedOrdersCount += order.items.filter(item => item.status === "Completed").length;
    });
    
    return res.status(200).json({
      totalOrders,
      totalRevenue: revenue,
      totalOrderedServices,
      upcomingOrdersCount,
      subscriptionCount,
      completedOrdersCount,
    });
  } catch (error) {
    console.error("Error fetching total orders and revenue:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Retrieves all orders for admin users.
export const getAllOrders = async (req, res, next) => {
  try {
    // Check if the user is an admin
    const userId = req.user.id; 
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Get all orders and populate userId to get username
    const orders = await Order.find()
      .populate('items.productId', 'name price') // Populate product details
      .populate('userId', 'username'); // Populate userId to get username

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}