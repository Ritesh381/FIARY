const mongoose = require("mongoose");

const Repetitive_Activities_Schema = new mongoose.Schema({
  task: { type: String },
  logs: [
    {
      date: { type: Date, required: true },
      completed: { type: Boolean, default: false },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Repetitive_Activities = mongoose.model(
  "Habit",
  Repetitive_Activities_Schema
);

module.exports = Repetitive_Activities;
