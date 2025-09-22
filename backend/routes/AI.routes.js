const express = require("express");
const {dailyInsight, weeklyInsight} = require("../controllers/AI.controllers")
const isAuth = require("../middleware/isAuth")

const aiRouter = express.Router()

aiRouter.post("/one/:id", isAuth, dailyInsight)
aiRouter.get("/week", isAuth, weeklyInsight)

module.exports = aiRouter
