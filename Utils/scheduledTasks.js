import cron from "node-cron";
import Service from "../Models/servicesModel.js";
import { updateServiceRatingAndReviewCount } from "../Controllers/reviewController.js";

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
