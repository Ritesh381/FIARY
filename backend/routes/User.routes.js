const express = require("express");
const { getUserById, getCurrentUser, updateUserProfile, deleteUser } = require("../controllers/User.controller");
const isAuth = require("../middleware/isAuth");

const userRouter = express.Router();

userRouter.get("/:id", isAuth, getUserById);
userRouter.get("/me", isAuth, getCurrentUser);
userRouter.put("/profile", isAuth, updateUserProfile);
userRouter.delete("/", isAuth, deleteUser);

module.exports = userRouter;
