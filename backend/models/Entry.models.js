const mongoose = require("mongoose");

// const EntrySchema = new mongoose.Schema(
//   {
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     sleep: { type: Number, required: true },
//     why_bad_sleep: {type:String},
//     masterbation: { type: Boolean, default: false },
//     masterbation_urge: {type:String},
//     bath: {type:Boolean, default:false},
//     diary: {type:String},
//     best_part_of_day: {type:String},
//     worst_part_of_day: {type:String},
//     feeling: {type: String},
//     towards_goal: {type:String},
//     time_wasted: {type:Number},
//     why_time_wasted: {type:String},
//     physical : {type:String},
//     habits: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Habit'
//     }],
//     repetitive_activities: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Repetitive_Activities'
//     }],

//   },
//   { timestamps: true }
// );

// const Entry = mongoose.model("Entry", EntrySchema);

// module.exports = Entry;

const EntrySchema = new mongoose.Schema(
  {
    date: {type: Date},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // --- Daily Reflection ---
    feelingScore: { type: Number, min: 1, max: 10, required: true },
    feeling: { type: String },
    bestMoment: { type: String },
    worstMoment: { type: String },

    // --- Goal & Productivity ---
    achievement: { type: String },
    timeWastedMinutes: { type: Number },
    timeWastedNotes: { type: String }, // What you wasted time on

    // --- Physical & Wellness ---
    sleepHours: { type: Number, required: true },
    sleepNotes: { type: String }, // For 'why bad sleep' or 'why good sleep'
    physicalActivity: { type: String },
    didMasturbate: { type: Boolean, default: false },
    masturbationNotes: { type: String }, // For 'urge', 'reason', etc.
    didTakeBath: { type: Boolean, default: false },

    // --- The Narrative ---
    diaryEntry: { type: String },
  },
  {
    timestamps: true, 
  }
);

const Entry = mongoose.model("Entry", EntrySchema);

module.exports = Entry;
