const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to your User model
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  photoUrl: {
    type: String, // Will store a link to the photo
    default: null
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  category: {
    type: String,
    trim: true
  },
  // This field will be calculated and stored automatically
  expiresAt: {
    type: Date,
    required: true
  },
  // Recommended for "soft deleting" todos
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  repeatingTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'RepeatingTask',
    default: null,
    index: true
  }
}, {
  timestamps: true
});


// --- MIDDLEWARE TO SET EXPIRATION DATE ---
// This function runs BEFORE a new document is saved to the database
TodoSchema.pre('save', function(next) {
  // We only want to set the expiration date when the todo is first created
  if (!this.isNew) {
    return next();
  }

  const now = new Date();
  let expiryDate = new Date(now);

  switch (this.frequency) {
    case 'daily':
      // Set to the end of the current day (23:59:59.999)
      expiryDate.setHours(23, 59, 59, 999);
      break;

    case 'weekly':
      // Find the next Sunday and set to the end of that day
      const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ...
      const daysUntilSunday = 7 - dayOfWeek;
      expiryDate.setDate(now.getDate() + daysUntilSunday);
      expiryDate.setHours(23, 59, 59, 999);
      break;

    case 'monthly':
      // Set to the last millisecond of the current month
      expiryDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      expiryDate.setHours(23, 59, 59, 999);
      break;
  }

  this.expiresAt = expiryDate;
  next();
});


const Todo = mongoose.model("Todo", TodoSchema);

module.exports = { Todo };