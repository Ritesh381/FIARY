const mongoose = require("mongoose");

const thoughtSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Types.ObjectId },
    title: { type: String },
    body: { type: String },
    tags: [],
  },
  { timestamps: true }
);

const Thoughts = mongoose.model("thoughts", thoughtSchema);

module.exports = Thoughts;
