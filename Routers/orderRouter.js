import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { getOrders, toggleReminder , getTotalOrdersAndRevenue, getAllOrders} from '../Controllers/orderController.js';


const orderRouter = express.Router();

// Route to get all orders for the authenticated user
orderRouter.get('/orders', verifyToken, getOrders);

// Route to toggle the reminder for an order item
orderRouter.post('/toggle-reminder', verifyToken, toggleReminder);

// Route to get total orders and revenue for admin users
orderRouter.get('/total-orders', verifyToken, getTotalOrdersAndRevenue);

// Route to get all orders for admin users
orderRouter.get('/all', verifyToken, getAllOrders);


export default orderRouter;