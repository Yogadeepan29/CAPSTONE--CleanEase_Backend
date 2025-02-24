import { errorHandler } from "../Utils/Error.js";
import User from "../Models/userModel.js";
import bcryptjs from 'bcryptjs'

// Updates user information.
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Unauthorized access to update the user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters long"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password,10)
  }
  if (req.body.username) {
    if (req.body.username.length < 3 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 3 and 20 characters long")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      {
        new: true,
      }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Deletes a user from the database.
export const deleteUser  = async (req, res, next) => {
  try {
    // Check if the user is an admin
    const requesterUser  = await User.findById(req.user.id);

    if (!requesterUser ) {
      return next(errorHandler(404, 'User  not found'));
    }

    // Allowing admins to delete any user, or allow users to delete themselves
    if (!requesterUser .isAdmin && req.user.id !== req.params.id) {
      return next(errorHandler(403, 'You are not allowed to delete this user'));
    }

    // Proceed to delete the user
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json('User  deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Adds a new address for the user.
export const addUserAddress = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Unauthorized access to add the address"));
  }

  const { fullName, mobileNumber, doorNumber, streetName, area, city, pinCode, state } = req.body;

  if (!fullName || !mobileNumber || !doorNumber || !streetName || !area || !city || !pinCode || !state) {
    return next(errorHandler(400, "All address fields are required"));
  }

  try {
    const updatedUser  = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          addresses: {
            fullName,
            mobileNumber,
            doorNumber,
            streetName,
            area,
            city,
            pinCode,
            state,
          },
        },
      },
      {
        new: true,
      }
    );

    const { password, ...rest } = updatedUser ._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Updates an existing address for the user.
export const updateUserAddress = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Unauthorized access to update the address"));
  }

  const { addressId, fullName, mobileNumber, doorNumber, streetName, area, city, pinCode, state } = req.body;

  if (!addressId || !fullName || !mobileNumber || !doorNumber || !streetName || !area || !city || !pinCode || !state) {
    return next(errorHandler(400, "All address fields are required"));
  }

  try {
    const updatedUser  = await User.findOneAndUpdate(
      { _id: req.params.id, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.fullName": fullName,
          "addresses.$.mobileNumber": mobileNumber,
          "addresses.$.doorNumber": doorNumber,
          "addresses.$.streetName": streetName,
          "addresses.$.area": area,
          "addresses.$.city": city,
          "addresses.$.pinCode": pinCode,
          "addresses.$.state": state,
        },
      },
      { new: true }
    );

    if (!updatedUser ) {
      return next(errorHandler(404, "Address not found"));
    }

    const { password, ...rest } = updatedUser ._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Function to delete an address
export const deleteUserAddress = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, "Unauthorized access to delete the address"));
  }

  const { addressId } = req.body;

  try {
    const updatedUser  = await User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser ._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Retrieves the total number of users (Admins Only).
export const getTotalUsers = async (req, res, next) => {
  try {
    // Check if the user is an admin
    const userId = req.user.id; // Assuming you have user ID from the token
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Get total users who are not admins
    const totalUsers = await User.countDocuments({ isAdmin: false });
    res.status(200).json({ totalUsers });
  } catch (error) {
    next(error);
  }
};

// Retrieves all users execpt admins ( Admin Only)
export const getAllUsers = async (req, res, next) => {
  try {
      const userId = req.user.id; // Assuming you have user ID from the token
      const user = await User.findById(userId);

      if (!user || !user.isAdmin) {
          return res.status(403).json({ message: "Access denied. Admins only." });
      }

      // Get all users who are not admins
      const users = await User.find({ isAdmin: false }).select('username email stripeCustomerId createdAt');
      res.status(200).json(users); // This should return an array
  } catch (error) {
      next(error);
  }
};