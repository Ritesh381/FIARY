const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HabitSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String
  },
  picture: {
    type: String
  },
  habitType: {
    type: String,
    enum: ['develop', 'quit'],
    required: [true, "Please specify if this is a habit to 'develop' or 'quit'."],
    default: 'develop'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, {timestamps:true});

const HabitEntrySchema = new mongoose.Schema({
  habitId: {
    type: Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
})
HabitEntrySchema.index({ habitId: 1, date: 1 }, { unique: true });

const Habit = mongoose.model("Habit", HabitSchema);
const HabitEntry = mongoose.model("HabitEntry", HabitEntrySchema)

module.exports = { Habit, HabitEntry };


