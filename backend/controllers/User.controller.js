const User = require("../models/User.models");

const FILE = "User.controller.js";

const getUserById = async (req, res) => {
  const functionName = "getUserById";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching user id=${req.params.id}`);
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] User not found id=${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Returning user id=${user._id}`);
    res.status(200).json({ user });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [getUserById] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentUser = async (req, res) => {
  const functionName = "getCurrentUser";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching current user`);
  try {
    const user = await User.findById(req.userId).select("-password -isDeleted -__v -createdAt -updatedAt");

    if (!user) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Current user not found id=${req.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Returning current user id=${user._id}`);
    res.status(200).json(user);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [getCurrentUser] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  const functionName = "updateUserProfile";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting profile update`);
  try {
    const { name, dob, bio } = req.body;

    // Handle uploaded profile photo(s)
    const photos = req.files?.map((file) => file.path) || [];
    const profilePic = photos.length > 0 ? photos[0] : undefined;

    // Validate: at least one field should be updated
    if (!name && !dob && !bio && !profilePic) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] No update fields provided`);
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

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating user with data keys=${Object.keys(updateData).join(",")}`);
    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -isDeleted");

    if (!updatedUser) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated user not found`);
      return res.status(404).json({ message: "User not found." });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Profile updated id=${updatedUser._id}`);
    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [updateUserProfile] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};



const deleteUser = async (req, res) => {
  const functionName = "deleteUser";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting user`);
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] User not found`);
      return res.status(404).json({ message: "User not found" });
    }

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    console.log(`[ACTION] [${req.userId || "unknown"}] deleted user ${req.userId}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [deleteUser] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserById,
  getCurrentUser,
  updateUserProfile,
  deleteUser,
};
