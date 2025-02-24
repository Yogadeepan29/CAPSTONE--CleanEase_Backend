import express from 'express';
import { addToCart, getCart,removeFromCart,removeMultipleFromCart, updateAddonsInCart, clearCart ,updateSubscription } from '../Controllers/cartController.js';
import { verifyToken } from '../Middleware/verifyToken.js';

const cartRouter = express.Router();

// Route to add an item to the cart
cartRouter.post('/add', verifyToken, addToCart);

// Route to get the user's cart
cartRouter.get('/', verifyToken, getCart);

// Route to remove an item from the cart
cartRouter.delete('/remove', verifyToken, removeFromCart);

// Route to remove multiple items from the cart
cartRouter.delete('/remove-multiple', verifyToken, removeMultipleFromCart);

// Route to update addons for an item in the cart
cartRouter.put('/update-addons', verifyToken, updateAddonsInCart);

// Route to clear the cart
cartRouter.delete('/clear', verifyToken, clearCart);

// Route to update the subscription status for an item in the cart
cartRouter.put('/update-subscription', verifyToken, updateSubscription);


export default cartRouter;