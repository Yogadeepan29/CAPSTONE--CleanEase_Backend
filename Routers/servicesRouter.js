// Routers/servicesRouter.js
import express from "express";
import {
  getServices,
  getServiceByCategoryAndName,
  filterServicesByCategories,
  getProductByIdAndCategory,
  getAddonsByIds,
  updateService,
  updateAdminService,
  addService,
  deleteService,
} from "../Controllers/serviceController.js";

const servicesRouter = express.Router();

// Route to get all services
servicesRouter.get("/", getServices);

// Route to add a new service
servicesRouter.post("/", addService);

// Route to get a product using category and name
servicesRouter.get("/:category/:productName", getServiceByCategoryAndName);

// Route to get a product using category and ID
servicesRouter.get("/:category/product/:productId", getProductByIdAndCategory);

// Route to filter services by categories
servicesRouter.get("/:categories", filterServicesByCategories);

// Route to find addon details by IDs
servicesRouter.get("/:category/:productName/addons/:ids", getAddonsByIds);

// Route to update service by product ID
servicesRouter.put("/product/:id", updateService);

// Route to update service by product ID for admin users
servicesRouter.put("/product/:id/admin", updateAdminService);

// Route to delete service by product ID
servicesRouter.delete("/product/:id", deleteService);

export default servicesRouter;
