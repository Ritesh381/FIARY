const express = require("express");
const {
  createHabit,
  editHabit,
  deleteHabit,
  getAllHabits,
  getEntriesOfOneHabit,
  upsertHabitEntry,
  getHabitEntriesForOneDay,
} = require("../controllers/Habits.controllers"); // Corrected file name casing
const isAuth = require("../middleware/isAuth");

const HabitRouter = express.Router();

// --- Habit Routes (These are correct) ---
HabitRouter.get("/", isAuth, getAllHabits);
HabitRouter.post("/", isAuth, createHabit);
HabitRouter.patch("/:id", isAuth, editHabit);
HabitRouter.delete("/:id", isAuth, deleteHabit);
HabitRouter.post("/entry/:habitId", isAuth, getEntriesOfOneHabit);
HabitRouter.get("/entry/bydate", isAuth, getHabitEntriesForOneDay);

// This route matches the frontend API call: POST /habit/entry
// It handles creating/updating a single entry (e.g., from a click)
HabitRouter.post("/entry", isAuth, upsertHabitEntry);

module.exports = HabitRouter;
