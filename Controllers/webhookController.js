// Controllers/webhookController.js
import Stripe from 'stripe';
import Checkout from '../Models/checkoutModel.js'; // Adjust the path as necessary

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handles incoming Stripe webhooks.
export const handleWebhook = async (req, res) => {
    let event;

      // Verify the webhook signature
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

     // Handle the event based on its type
    if (event.type === 'charge.succeeded') {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent; 
        const receiptUrl = charge.receipt_url; 

        try {
            // Retrieve the session using the paymentIntentId
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
        
            if (session.data.length > 0) {
                const sessionId = session.data[0].id; // Get the session ID

                // Find the Checkout document using sessionId
                const checkout = await Checkout.findOne({ sessionId: sessionId });

                if (checkout) {
                    // Update the Checkout document with the receipt URL
                    checkout.receiptUrl = receiptUrl;
                    await checkout.save();
                    console.log(`Updated Checkout with ID: ${checkout._id} and Receipt URL: ${receiptUrl}`);
                } else {
                    console.error(`Checkout document not found for session ID: ${sessionId}`);
                }
            } else {
                console.error(`No session found for paymentIntentId: ${paymentIntentId}`);
            }
        } catch (err) {
            console.error(`Error updating receipt URL: ${err.message}`);
        }
    }

    res.json({ received: true });
};