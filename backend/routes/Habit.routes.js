const express = require("express");
const {
  createHabit,
  editHabit,
  deleteHabit,
  getAllHabits,
  getEntriesOfOneHabit,
  createEntries,
  updateEntries,
} = require("../controllers/Habits.controllers");
const isAuth = require("../middleware/isAuth");

const HabitRouter = express.Router();

// --- Habit Routes ---
HabitRouter.get("/", isAuth, getAllHabits);
HabitRouter.post("/", isAuth, createHabit);
HabitRouter.patch("/:id", isAuth, editHabit); // Changed to PATCH for semantic correctness
HabitRouter.delete("/:id", isAuth, deleteHabit);

// --- Habit Entry Routes ---
HabitRouter.post("/entry/query", isAuth, getEntriesOfOneHabit); // Changed to POST to accept a body
HabitRouter.post("/entry", isAuth, createEntries); // Changed to POST
HabitRouter.patch("/entry/:id", isAuth, updateEntries); // Changed to PATCH for bulk update

module.exports = HabitRouter;
