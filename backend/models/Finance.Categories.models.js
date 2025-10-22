const mongoose = require("mongoose");

// SubCategory model
const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // link to parent category
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = global category
  isGlobal: { type: Boolean, default: false },
});

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);

// Category model
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isGlobal: { type: Boolean, default: false },
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = { Category, SubCategory };
