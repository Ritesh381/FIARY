const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RepeatingTaskSchema = new Schema({
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
  photoUrl: {
    type: String,
    default: null
  },
  category: {
    type: String,
    trim: true
  },
  taskFrequencyToCreate: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  repeatSchedule: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true
    },
    // For 'weekly': [0, 1, 2, 3, 4, 5, 6] (Sun, Mon, Tue, etc.)
    daysOfWeek: {
      type: [Number],
      default: undefined
    },
    // For 'monthly': e.g., 15 (for the 15th of the month)
    dayOfMonth: {
      type: Number,
      default: undefined
    }
  },
  
  // So the user can "pause" a repeating task
  isActive: {
    type: Boolean,
    default: true
  },
  
  startDate: {
    type: Date,
    default: Date.now
  },
  // Optional: so the rule can end
  endDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });


const RepeatingTask = mongoose.model("RepeatingTask", RepeatingTaskSchema);

module.exports = RepeatingTask;