const express = require("express");
const {
  saveEntry,
  getAllEntries,
  editEntry,
  deleteEntry,
} = require("../controllers/Entry.controllers.js");
const isAuth = require("../middleware/isAuth");

const entryRouter = express.Router();

entryRouter.post("/save", isAuth, saveEntry);
entryRouter.get("/", isAuth, getAllEntries);
entryRouter.post("/edit/:id", isAuth, editEntry);
entryRouter.delete("/:id", isAuth, deleteEntry);

module.exports = entryRouter;
