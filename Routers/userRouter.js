import { deleteUser, updateUser,addUserAddress, updateUserAddress ,deleteUserAddress, getTotalUsers, getAllUsers} from "../Controllers/userController.js";
import express from 'express';
import { verifyToken } from "../Middleware/verifyToken.js";



const router = express.Router();

// Route to update user information
router.put("/update/:id", verifyToken, updateUser );

// Route to delete a user
router.delete("/delete/:id", verifyToken, deleteUser );

// Route to add a new address for the user
router.post("/add/address/:id", verifyToken, addUserAddress);

// Route to update an existing address for the user
router.put("/update/address/:id", verifyToken, updateUserAddress);

// Route to delete an address for the user
router.delete("/delete/address/:id", verifyToken, deleteUserAddress);

// Route to get total users for admin users
router.get("/total", verifyToken, getTotalUsers);

// Route to get all users excluding admins
router.get("/all", verifyToken, getAllUsers);

export default router;