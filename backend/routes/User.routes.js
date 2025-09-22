const express = require("express");
const { getUserById } = require("../controllers/User.controllere");
const isAuth = require("../middleware/isAuth");

const userRouter = express.Router();

userRouter.get("/:id", isAuth, getUserById);

module.exports = userRouter;
