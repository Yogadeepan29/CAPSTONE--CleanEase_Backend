import Service from "../Models/servicesModel.js";
import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Fetch all services
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({});
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    next(errorHandler(500, "Error fetching services"));
  }
};

// Get service by category and product name
export const getServiceByCategoryAndName = async (req, res, next) => {
  const { category, productName } = req.params;
  try {
    const service = await Service.findOne({
      category,
      "products.name": productName,
    });
    if (!service) {
      return next(errorHandler(404, "Product not found"));
    }
    const product = service.products.find(
      (product) => product.name === productName
    );
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    next(errorHandler(500, "Error fetching product"));
  }
};

// Filter services by categories
export const filterServicesByCategories = async (req, res, next) => {
  const categories = req.params.categories;
  const categoryArray = categories.split(",");

  try {
    const filteredServices = await Service.find({
      category: { $in: categoryArray },
    });

    if (filteredServices.length === 0) {
      return next(
        errorHandler(404, "No services found for the specified categories")
      );
    }

    res.status(200).json(filteredServices);
  } catch (error) {
    console.error("Error filtering services:", error);
    next(errorHandler(500, "Error filtering services"));
  }
};

// Gets a service by its ID and category.
export const getProductByIdAndCategory = async (req, res, next) => {
  const { category, productId } = req.params;

  try {
    const service = await Service.findOne({ category });
    const product = service.products.id(productId);
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID and category:", error);
    next(errorHandler(500, "Error fetching product"));
  }
};

// Get Addons By Ids
export const getAddonsByIds = async (req, res, next) => {
  const { category, productName, ids } = req.params;

  try {
    const service = await Service.findOne({
      category,
      "products.name": productName,
    });

    if (!service) {
      return next(errorHandler(404, "Service not found"));
    }

    const product = service.products.find(
      (product) => product.name === productName
    );

    if (!product) {
      return next(errorHandler(404, "Product not found"));
    }

    const idArray = ids.split(","); // Split the IDs by comma
    const addons = idArray
      .map((id) => product.addons.id(id))
      .filter((addon) => addon); // Find addons by ID

    if (addons.length === 0) {
      return next(errorHandler(404, "No addons found for the specified IDs"));
    }

    res.status(200).json(addons);
  } catch (error) {
    console.error("Error fetching addons:", error);
    next(errorHandler(500, "Error fetching addons"));
  }
};

// Update service by product ID for Inbuild Services
export const updateService = async (req, res, next) => {
  const { id } = req.params; // Extract the product ID from the URL parameters
  const { name, price } = req.body; // Extract the new name and price from the request body

  try {
    // Find the service containing the product with the given ID
    const service = await Service.findOne({ "products._id": id });

    if (!service) {
      return next(errorHandler(404, "Service not found"));
    }

    // Get the product from the service
    const product = service.products.find(
      (product) => product._id.toString() === id
    );

    // Update the product name and price in the local database
    const updatedService = await Service.findOneAndUpdate(
      { "products._id": id },
      { $set: { "products.$.name": name, "products.$.price": price } },
      { new: true }
    );

    // Check if the product has stripePriceId and stripeProductId
    const stripePriceId = product.stripePriceId;
    const stripeProductId = product.stripeProductId;

    if (stripePriceId && stripeProductId) {
      // If both IDs exist, proceed to update the product in Stripe
      await stripe.products.update(stripeProductId, {
        name: name, // Update the product name
      });

      // Retrieve the price details to get the associated product ID
      const priceDetails = await stripe.prices.retrieve(stripePriceId);

      // Create a new price in Stripe using the associated product ID
      if (priceDetails && priceDetails.product) {
        const newPrice = await stripe.prices.create({
          unit_amount: price * 100, // Convert to cents
          currency: "inr", // Set the currency to INR
          recurring: {
            interval: "month", // Set the interval to monthly
          },
          product: priceDetails.product, // Use the product ID associated with the price
        });

        // Set the new price as the default price for the product
        await stripe.products.update(priceDetails.product, {
          default_price: newPrice.id, // Set the new price as the default price
        });

        // Update the service with the new price ID if needed
        await Service.findOneAndUpdate(
          { "products._id": id },
          { $set: { "products.$.stripePriceId": newPrice.id } } // Update the price ID in your service model
        );
      }
    }

    res.status(200).json(updatedService); // Respond with the updated service
  } catch (error) {
    console.error("Error updating service:", error);
    next(errorHandler(500, "Error updating service"));
  }
};

// Creating a new service (Admins Only)
export const addService = async (req, res, next) => {
  const { category, products } = req.body; // Extract category and products from the request body

  try {
    // Check if the category already exists
    let service = await Service.findOne({ category });

    // If the category does not exist, create a new service
    if (!service) {
      service = new Service({ category, products: [] });
    }

    // Handle Stripe integration for all products
    for (const product of products) {
      // Create a product in Stripe
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        images: [product.productImg],
      });

      // Create a price in Stripe
      const stripePrice = await stripe.prices.create({
        unit_amount: product.price * 100, // Convert to cents
        currency: "inr", // Set the currency to INR
        recurring: product.enableSubscription // Set recurring only if subscription is enabled
          ? { interval: "month" } // Set the interval to monthly if subscription is enabled
          : undefined, // No recurring if subscription is not enabled
        product: stripeProduct.id, // Use the created product ID
      });

      // Add the Stripe IDs to the product
      product.stripeProductId = stripeProduct.id;
      product.stripePriceId = stripePrice.id;

      // Set the subscription property based on the enableSubscription state
      product.subscription = product.enableSubscription; // Set subscription to true or false based on the checkbox
      // Add the product to the service's products array
      service.products.push(product);
    }

    // Save the service
    await service.save();

    res.status(201).json(service); // Respond with the created service
  } catch (error) {
    console.error("Error adding service:", error);
    next(errorHandler(500, "Error adding service"));
  }
};

// Updates an existing service by product ID (Admins Only).
export const updateAdminService = async (req, res, next) => {
  const { id } = req.params; // Extract the product ID from the URL parameters
  const {
    name,
    price,
    description,
    duration,
    idealFor,
    productImg,
    enableSubscription,
    features,
    addons,
  } = req.body; // Extract all necessary fields from the request body

  try {
    // Find the service containing the product with the given ID
    const service = await Service.findOne({ "products._id": id });

    if (!service) {
      return next(errorHandler(404, "Service not found"));
    }

    // Update the product in the service
    const updatedService = await Service.findOneAndUpdate(
      { "products._id": id },
      {
        $set: {
          "products.$.name": name,
          "products.$.price": price,
          "products.$.description": description,
          "products.$.duration": duration,
          "products.$.idealFor": idealFor,
          "products.$.productImg": productImg,
          "products.$.enableSubscription": enableSubscription,
          "products.$.subscription": enableSubscription, // Set subscription based on the checkbox
          "products.$.features": features,
          "products.$.addons": addons,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedService); // Respond with the updated service
  } catch (error) {
    console.error("Error updating service:", error);
    next(errorHandler(500, "Error updating service"));
  }
};

// Deletes a service by product ID. (Admins Only , Only newly added service)
export const deleteService = async (req, res, next) => {
  const { id } = req.params; // Extract the product ID from the URL parameters

  try {
    // Find the service containing the product with the given ID
    const service = await Service.findOne({ "products._id": id });

    if (!service) {
      return next(errorHandler(404, "Service not found"));
    }

    // Get the product from the service
    const product = service.products.find(
      (product) => product._id.toString() === id
    );

    // Check if the product was added by "Admin"
    if (product.addedBy !== "Admin") {
      return next(
        errorHandler(403, "You are not allowed to delete this service")
      );
    }

    // Remove the product from the service using $pull
    await Service.updateOne(
      { "products._id": id },
      { $pull: { products: { _id: id } } }
    );

    // Check if the category has any products left
    const updatedService = await Service.findOne({ _id: service._id });

    // If there are no products left, remove the category
    if (updatedService && updatedService.products.length === 0) {
      await Service.deleteOne({ _id: updatedService._id });
    }

    // Remove the service from all users' carts
    await User.updateMany(
      { "cart.productId": id },
      { $pull: { cart: { productId: id } } }
    );

    res
      .status(200)
      .json({
        message: "Service deleted successfully and removed from users' carts",
      });
  } catch (error) {
    console.error("Error deleting service:", error);
    next(errorHandler(500, "Error deleting service"));
  }
};
