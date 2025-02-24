import Checkout from "../Models/checkoutModel.js";
import User from "../Models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Creates a checkout session for one-time payments.
export const createCheckoutSession = async (req, res) => {
  const { items, totalPrice, source } = req.body;

  const isSubscription = items.some((item) => item.subscription);

  try {
    const checkoutData = new Checkout({
      userId: req.user.id,
      checkoutData: {
        items: items,
        totalPrice: totalPrice,
        source: source,
      },
      subscription: isSubscription,
    });
    const savedCheckout = await checkoutData.save();
    // Check if any item is a subscription

    if (isSubscription) {
      // Create a subscription session
      const subscriptionItems = items.map((item) => ({
        price: item.productDetail.stripePriceId,
        quantity: 1,
      }));

      const subscription = await stripe.subscriptions.create({
        customer: req.user.stripeCustomerId,
        items: subscriptionItems,
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        metadata: { checkoutId: savedCheckout._id.toString() },
        expand: ["latest_invoice.payment_intent"],
      });

      return res
        .status(200)
        .json({ id: subscription.id, checkoutId: savedCheckout._id });
    } else {
      // Create a one-time payment session
      const lineItems = items.map((item) => {
        const productDetail = item.productDetail;
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: productDetail.name,
            },
            unit_amount: item.subtotal * 100, // Convert to cents
          },
          quantity: 1,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `https://ryd-cleanease.netlify.app/order/success?id=${savedCheckout._id}`,
        cancel_url: "https://ryd-cleanease.netlify.app/order/cancel",
        metadata: { checkoutId: savedCheckout._id.toString() },
        payment_intent_data: {
          metadata: {
            checkoutId: savedCheckout._id.toString(),
          },
        },
      });

      savedCheckout.sessionId = session.id;
      await savedCheckout.save();
      return res
        .status(200)
        .json({ id: session.id, checkoutId: savedCheckout._id });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

// Creates a checkout session specifically for subscriptions.
export const createCheckoutSessionForSubscription = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user || !user.stripeCustomerId) {
    return res
      .status(400)
      .json({ error: "User  does not have a Stripe customer ID." });
  }

  const { items, totalPrice, source } = req.body;

  try {
    // Create a checkout entry in database
    const checkoutData = new Checkout({
      userId: userId,
      checkoutData: {
        items: items,
        totalPrice: totalPrice,
        source: source,
      },
      subscription: true,
    });
    const savedCheckout = await checkoutData.save();

    const subscriptionItems = items
      .filter((item) => item.productDetail.stripePriceId)
      .map((item) => ({
        price: item.productDetail.stripePriceId,
        quantity: 1,
      }));

    if (subscriptionItems.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid subscription items provided." });
    }

    // Create a Checkout session for subscriptions
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: subscriptionItems,
      mode: "subscription",
      success_url: `http://localhost:3000/order/success?id=${savedCheckout._id}`,
      cancel_url: "http://localhost:3000/cancel",
      customer: user.stripeCustomerId,
      metadata: { checkoutId: savedCheckout._id.toString() },
    });

    savedCheckout.sessionId = session.id; // Save the session ID
    await savedCheckout.save();
    return res
      .status(200)
      .json({ id: session.id, checkoutId: savedCheckout._id });
  } catch (error) {
    console.error("Error creating checkout session for subscription:", error);
    res.status(500).json({ error: error.message });
  }
};
