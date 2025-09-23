const express = require("express");
const {dailyInsight, weeklyInsight, monthlyInsight} = require("../controllers/AI.controllers")
const isAuth = require("../middleware/isAuth")

const aiRouter = express.Router()

aiRouter.post("/one/:id", isAuth, dailyInsight)
aiRouter.get("/week", isAuth, weeklyInsight)
aiRouter.get("/month", isAuth, monthlyInsight)

module.exports = aiRouter
