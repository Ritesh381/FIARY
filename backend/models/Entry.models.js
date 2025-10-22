const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema(
  {
    date: {type: Date},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // --- Daily Reflection ---
    feelingScore: { type: Number, min: 1, max: 10, required: true },
    // --- Goal & Productivity ---
    achievement: { type: String },
    timeWastedMinutes: { type: Number },
    timeWastedNotes: { type: String }, // What you wasted time on

    // --- Wellness ---
    sleepHours: { type: Number, required: true },
    sleepNotes: { type: String }, // For 'why bad sleep' or 'why good sleep'
    
    // --- The Narrative ---
    diaryEntry: { type: String },
  },
  {
    timestamps: true, 
  }
);

const Entry = mongoose.model("Entry", EntrySchema);

module.exports = Entry;
