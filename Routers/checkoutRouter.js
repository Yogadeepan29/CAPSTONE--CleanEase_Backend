// Routes/checkoutRouter.js
import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { getCheckoutData, createOrderFromCheckoutData } from '../Controllers/checkoutController.js';

const checkoutRouter = express.Router();

// Route to get checkout data by sessionId
checkoutRouter.get('/:checkoutId', verifyToken, getCheckoutData);

// Route to create order from checkout data
checkoutRouter.post('/create-from-checkout/:checkoutId', verifyToken, createOrderFromCheckoutData);

export default checkoutRouter;