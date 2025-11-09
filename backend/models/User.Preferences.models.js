const mongoose = require("mongoose");

const UserPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    darkMode: { type: Boolean, default: false },
    emailSubscribed: { type: Boolean, default: true },     // send emails as reminders and updates
    aiPreferences: { type: String, default: ""},
    customShelf: [
        {
            shelfID: { type: String, required: true },
            schema: { type: Object, required: true },
        },
    ],
    finCategoryOrder: { type: [String], default: [] }, // Array of category IDs in preferred order
    finSubCategoryOrder: { type: [String], default: [] }, // Array of sub-category IDs in preferred order
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserPreferenceSchema);
module.exports = User;
