const express = require("express");
const {
  saveEntry,
  getAllEntries,
  editEntry,
} = require("../controllers/Entry.controllers.js");

const entryRouter = express.Router();

entryRouter.post("/save", saveEntry);
entryRouter.get("/", getAllEntries);
entryRouter.post("/edit/:id", editEntry)

module.exports = entryRouter;
