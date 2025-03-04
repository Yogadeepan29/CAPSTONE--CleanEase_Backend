import cron from "node-cron";
import Service from "../Models/servicesModel.js";
import { updateServiceRatingAndReviewCount } from "../Controllers/reviewController.js";
import Order from "../Models/orderModel.js";
import { fromZonedTime, isAfter } from "date-fns-tz";

// Schedule a task to run every 12 hours
cron.schedule("0 */12 * * *", async () => {
  try {
    console.log("Scheduled task running...");

    // Get all services
    const services = await Service.find();

    for (const service of services) {
      for (const product of service.products) {
        await updateServiceRatingAndReviewCount(service.category, product._id);
      }
    }

    console.log("Service ratings and review counts updated successfully.");
  } catch (error) {
    console.error("Error updating service ratings and review counts:", error);
  }
});

// Schedule a task to run every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("Scheduled task running...");

    const currentDate = new Date();
    const orders = await Order.find(); // Fetch all orders

    for (const order of orders) {
      let orderUpdated = false;

      for (const item of order.items) {
        if (item.serviceDate && item.serviceTime) {
          const serviceDateTime = new Date(`${item.serviceDate} ${item.serviceTime}`);
          const serviceDateTimeUtc = fromZonedTime(serviceDateTime, 'Asia/Kolkata'); // Convert to UTC

          if (isAfter(currentDate, serviceDateTimeUtc)) {
            const twoHoursLater = new Date(serviceDateTimeUtc.getTime() + 2 * 60 * 60 * 1000);

            if (isAfter(currentDate, twoHoursLater)) {
              item.status = "Completed";
              // Call any additional logic for subscription items if needed
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
      }

      // If the order was updated, save it back to the database
      if (orderUpdated) {
        await Order.findByIdAndUpdate(order._id, { items: order.items }, { new: true });
      }
    }

    console.log("Order statuses updated successfully.");
  } catch (error) {
    console.error("Error updating order statuses:", error);
  }
});

// Function to update subscription items for an order
const updateSubscriptionItem = (item, serviceDateTime) => {
  item.lastServiceDate = item.serviceDate;
  const nextServiceDate = new Date(serviceDateTime);
  nextServiceDate.setMonth(nextServiceDate.getMonth() + 1); // Add one month
  item.serviceDate = nextServiceDate.toISOString().split("T")[0];
  item.status = "upcoming";
  item.reviewed = false;
};
