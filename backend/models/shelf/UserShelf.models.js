// models/UserShelf.js
const mongoose = require("mongoose");

const FieldSchema = new mongoose.Schema({
    key: { type: String, required: true },          // e.g. "Platform"
    type: { type: String, enum: ["text", "number", "boolean", "photo", "date", "url", "array"], required: true },
    required: { type: Boolean, default: false },
});

const ShelfSchema = new mongoose.Schema({
    name: { type: String, required: true },          // e.g. "Books", "Movies", "Courses"
    type: { type: String, enum: ["book", "movie", "custom"], required: true },
    icon: { type: String },                          // optional: emojies
    schema: [FieldSchema],                           // only for custom shelves
}, { timestamps: true });

const UserShelfSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        shelves: [ShelfSchema], // default shelves + custom shelves
    },
    { timestamps: true }
);

// Optional index for performance
UserShelfSchema.index({ userId: 1 });

module.exports = mongoose.model("UserShelf", UserShelfSchema);
