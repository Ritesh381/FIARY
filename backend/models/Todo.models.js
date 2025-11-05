const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

const TodoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  // photoUrl: { type: String, default: null },
  // frequency: { type: String, enum: FREQUENCIES, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  category: { type: String, trim: true },
  date: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false, index: true },
  // repeatingTaskId: { type: Schema.Types.ObjectId, ref: 'RepeatingTask', default: null, index: true }
}, { timestamps: true });


const Todo = mongoose.model("Todo", TodoSchema);
module.exports = Todo;
