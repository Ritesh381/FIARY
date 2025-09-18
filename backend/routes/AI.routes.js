const express = require("express");
const {dailyInsight} = require("../controllers/AI.controllers")
const isAuth = require("../middleware/isAuth")

const aiRouter = express.Router()

aiRouter.post("/one/:id", isAuth, dailyInsight)

module.exports = aiRouter
