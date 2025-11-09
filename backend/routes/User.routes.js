const express = require("express");
const { getUserById, getCurrentUser, updateUserProfile, deleteUser } = require("../controllers/User.controller");
const isAuth = require("../middleware/isAuth");
const upload = require("../config/multer");

const userRouter = express.Router();

// userRouter.get("/id/:id", isAuth, getUserById);
userRouter.get("/me", isAuth, getCurrentUser);
userRouter.put("/profile", isAuth, updateUserProfile);
userRouter.delete("/", isAuth, deleteUser);
userRouter.put("/update", isAuth, upload.array("profilePic", 10), updateUserProfile);

module.exports = userRouter;
