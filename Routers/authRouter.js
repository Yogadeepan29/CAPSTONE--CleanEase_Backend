import express from "express";
import {
  google,
  loginUser,
  registerUser,
} from "../Controllers/authController.js";

const router = express.Router();

// Route for New user Registration
router.post("/register-user", registerUser);

// Route for Existing user Login
router.post("/login-user", loginUser);

// Route for Google Authentication
router.post("/google", google);

export default router;
