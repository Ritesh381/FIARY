const User = require("../models/User.models");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -isDeleted -__v -createdAt -updatedAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, dob, bio } = req.body;

    // Handle uploaded profile photo(s)
    const photos = req.files?.map((file) => file.path) || [];
    const profilePic = photos.length > 0 ? photos[0] : undefined;
    console.log(photos)

    // Validate: at least one field should be updated
    if (!name && !dob && !bio && !profilePic) {
      return res.status(400).json({
        message:
          "At least one field (name, dob, bio, or profilePic) is required for update.",
      });
    }

    // Build update object dynamically (only include provided fields)
    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (bio) updateData.bio = bio;
    if (profilePic) updateData.profilePic = profilePic;

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -isDeleted");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};



const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserById,
  getCurrentUser,
  updateUserProfile,
  deleteUser,
};
