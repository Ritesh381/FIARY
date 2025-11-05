const express = require("express");
const { getAll, saveAll, updateAll } = require("../controllers/Common.controllers.js");
const isAuth = require("../middleware/isAuth");

const commonRouter = express.Router();

commonRouter.get("/all", isAuth, getAll);
commonRouter.post("/save-entry", isAuth, saveAll);
commonRouter.put("/update-entry", isAuth, updateAll);

module.exports = commonRouter;