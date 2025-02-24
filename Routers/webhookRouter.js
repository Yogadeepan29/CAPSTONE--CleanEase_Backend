// Routers/webhookRouter.js
import express from 'express';
import { handleWebhook } from '../Controllers/webhookController.js'; // Adjust the path as necessary

const router = express.Router();

// Webhook endpoint to handle Stripe events
router.post('/', express.raw({ type: 'application/json' }), handleWebhook);

export default router;