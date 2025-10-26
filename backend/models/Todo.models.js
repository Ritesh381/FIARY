const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

const TodoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  photoUrl: { type: String, default: null },
  frequency: { type: String, enum: FREQUENCIES, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  category: { type: String, trim: true },
  expiresAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  repeatingTaskId: { type: Schema.Types.ObjectId, ref: 'RepeatingTask', default: null, index: true }
}, { timestamps: true });

TodoSchema.pre('save', function(next) {
  if (!this.isNew) return next();

  const now = new Date();
  let expiryDate = new Date(now);

  switch (this.frequency) {
    case 'daily':
      expiryDate.setHours(23, 59, 59, 999);
      break;
    case 'weekly': {
      const dayOfWeek = now.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      expiryDate.setDate(now.getDate() + daysUntilSunday);
      expiryDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'monthly':
      expiryDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      expiryDate.setHours(23, 59, 59, 999);
      break;
  }

  this.expiresAt = expiryDate;
  next();
});

const Todo = mongoose.model("Todo", TodoSchema);
module.exports = Todo;
