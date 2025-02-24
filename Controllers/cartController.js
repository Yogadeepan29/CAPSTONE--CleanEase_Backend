import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";

// Adds a service to the user's cart.
export const addToCart = async (req, res, next) => {
  const { productId, category, addons } = req.body;
  const userId = req.user.id;

  // Validating required fields
  if (!productId || !category || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  try {
    const user = await User.findById(userId);
    const existingProductIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId
    );

    // Check if the product is already in the cart
    if (existingProductIndex >= 0) {
      return res
        .status(200)
        .json({ success: false, message: "Item already in cart." });
    } else {
      // Add the new product to the cart
      user.cart.push({
        productId,
        category,
        addons,
        prevAddons: addons,
        subscription: false,
      });
    }

    await user.save();
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// Removes a service from the user's cart.
export const removeFromCart = async (req, res, next) => {
  const { itemId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const existingProductIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    // Check if the item exists in the cart
    if (existingProductIndex >= 0) {
      // Remove the item from the cart
      user.cart.splice(existingProductIndex, 1);
      await user.save();
      return res.status(200).json({ success: true, cart: user.cart });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart." });
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// Removes multiple services from the user's cart.
export const removeMultipleFromCart = async (req, res, next) => {
  const { productIds } = req.body; // Expecting an array of productIds
  const userId = req.user.id;

  // Validate product IDs
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product IDs." });
  }

  try {
    const user = await User.findById(userId);

    // Filter out items that match the productIds
    user.cart = user.cart.filter(
      (item) => !productIds.includes(item.productId.toString())
    );

    await user.save();

    return res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// Retrieves the user's cart.
export const getCart = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("cart.productId");
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// Clears the user's cart.
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    user.cart = []; // Clear the cart
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Cart cleared successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Updates the addons for a specific item in the cart.
export const updateAddonsInCart = async (req, res, next) => {
  const { itemId, addons } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!itemId || !addons) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  try {
    const user = await User.findById(userId);
    const existingProductIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    // Check if the item exists in the cart
    if (existingProductIndex >= 0) {
      // Update the addons for the item
      user.cart[existingProductIndex].addons = addons;
      user.cart[existingProductIndex].prevAddons = addons;
      await user.save();
      return res.status(200).json({ success: true, cart: user.cart });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart." });
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// Updates the subscription status for a specific item in the cart.
export const updateSubscription = async (req, res, next) => {
  const { itemId, subscription } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    // Check if the item exists in the cart
    if (itemIndex >= 0) {
      if (subscription) {
        // Checkbox is checked: copy addons to prevAddons and clear addons
        user.cart[itemIndex].prevAddons = user.cart[itemIndex].addons;
        user.cart[itemIndex].addons = []; // Clear addons
      } else {
        // Checkbox is unchecked: restore addons from prevAddons
        user.cart[itemIndex].addons = user.cart[itemIndex].prevAddons;
        user.cart[itemIndex].prevAddons = []; // Clear prevAddons
      }
      user.cart[itemIndex].subscription = subscription; // Update the subscription status
      await user.save();
      return res.status(200).json({ success: true, cart: user.cart });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart." });
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
