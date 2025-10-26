const express = require("express");
const thoughtsRouter = express.Router();
const auth = require("../middleware/isAuth");
const {
  createThought,
  getAllThoughts,
  updateThought,
  deleteThought,
} = require("../controllers/Thoughts.controllers");

// CRUD Endpoints for Thoughts
thoughtsRouter.post("/", auth, createThought);
thoughtsRouter.get("/", auth, getAllThoughts);
thoughtsRouter.put("/:id", auth, updateThought); // Use PUT for full update
thoughtsRouter.delete("/:id", auth, deleteThought);

module.exports = thoughtsRouter;
