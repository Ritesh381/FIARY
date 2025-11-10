// models/ShelfItem.js
const mongoose = require("mongoose");

const ShelfItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shelfId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference to UserShelf.shelves._id
    type: { type: String, enum: ["book", "movie", "custom"], required: true },
    status: {
      type: String,
      enum: ["completed", "in-progress", "wishlist", "on-hold"],
      default: "in-progress",
    },
    data: { type: Object, default: {} }, // dynamic key-value pairs

  },
  { timestamps: true }
);

// 🔍 Indexes for fast queries
ShelfItemSchema.index({ userId: 1, shelfId: 1 });
ShelfItemSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("ShelfItem", ShelfItemSchema);
