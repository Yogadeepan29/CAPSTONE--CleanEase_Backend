import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
dotenv.config();

// New user Registration
export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate input fields
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All the Fields Are Required"));
  }

  try {
    // Check if the username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return next(errorHandler(400, "Username already exists"));
    }

    // Check if the email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return next(errorHandler(400, "Email already exists"));
    }

    // Hashing the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Creating a new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      name: username,
    });

    // Creating a new user in the database
    const newUser  = new User({
      username,
      email,
      password: hashedPassword,
      stripeCustomerId: customer.id,
    });

    await newUser .save();
    res
      .status(200)
      .json({ message: "User  Registered successfully", result: newUser  });
  } catch (error) {
    next(error);
  }
};
// Existing user Login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Validating input fields
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All the Fields Are Required"));
  }
  try {
    // Finding user by email
    const userDetail = await User.findOne({ email });
    if (!userDetail) {
      return next(errorHandler(401, "Invalid Email Address"));
    }
    // Compare the provided password with the stored hashed password
    const userPassword = bcryptjs.compareSync(password, userDetail.password);
    if (!userDetail || !userPassword) {
      return next(errorHandler(401, "Invalid Credentials"));
    }
    // Generating a JWT token
    const token = jwt.sign(
      { id: userDetail._id, isAdmin: userDetail.isAdmin },
      process.env.JWT_SECRET_KEY
    );

    // Exclude the password from the response
    const { password: passkey, ...rest } = userDetail._doc;

    res.status(200).json({ message: "User LoggedIn Sucessfully", rest, token });
  } catch (error) {
    next(error);
  }
};

// Google Authentication
export const google = async (req, res, next) => {
  const { email, name, profilePic } = req.body;
  try {
    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      // Generate a JWT token for existing user
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      const { password: passkey, ...rest } = user._doc;

      res
        .status(200)
        .json({ message: "User LoggedIn Sucessfully", rest, token });
    } else {
      // Generate a random password for new users
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);

      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: email,
        name: name,
      });

      // Create a new user in the database
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: profilePic,
        stripeCustomerId: customer.id,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET_KEY
      );
      const { password: passkey, ...rest } = newUser._doc;

      res
        .status(200)
        .json({ message: "User LoggedIn Sucessfully", rest, token });
    }
  } catch (error) {
    next(error);
  }
};
