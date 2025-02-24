// Routers/paymentRouter.js
import express from 'express';
import { createCheckoutSession , createCheckoutSessionForSubscription} from '../Controllers/paymentController.js';
import { verifyToken } from '../Middleware/verifyToken.js';

const router = express.Router();

// Route to create a checkout session for one-time payments
router.post('/create-checkout-session',verifyToken, createCheckoutSession);

// Route to create a checkout session for subscriptions
router.post('/create-checkout-session-for-subscription', verifyToken, createCheckoutSessionForSubscription);

export default router;