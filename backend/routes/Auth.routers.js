const express = require("express");
const {
  login,
  logout,
  register,
  check,
} = require("../controllers/Auth.controllers");
const isAuth = require("../middleware/isAuth");

const authRouter = express.Router();

authRouter.post("/signup", register);
authRouter.post("/signin", login);
authRouter.post("/logout", logout);
authRouter.get("/checkauth", isAuth, check);

module.exports = authRouter;
