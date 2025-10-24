const express = require("express");
const financeRouter = express.Router();
const {
  createFinance,
  getAllFinance,
  getFinanceById,
  updateFinance,
  deleteFinance,
} = require("../controllers/finance.controller");
const isAuth = require("../middleware/isAuth");

financeRouter.post("/", isAuth, createFinance);        // Create a new finance entry
financeRouter.get("/", isAuth, getAllFinance);        // Get all finance entries for logged-in user
financeRouter.get("/:id", isAuth, getFinanceById);    // Get a single finance entry by ID
financeRouter.put("/:id", isAuth, updateFinance);     // Update a finance entry by ID
financeRouter.delete("/:id", isAuth, deleteFinance);  // Delete a finance entry by ID

module.exports = financeRouter;
