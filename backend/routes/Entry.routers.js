const express = require("express");
const {
  saveEntry,
  getAllEntries,
  editEntry,
  deleteEntry
} = require("../controllers/Entry.controllers.js");

const entryRouter = express.Router();

entryRouter.post("/save", saveEntry);
entryRouter.get("/", getAllEntries);
entryRouter.post("/edit/:id", editEntry)
entryRouter.delete("/:id", deleteEntry)

module.exports = entryRouter;
