const mongoose = require("mongoose");

// SubCategory model
const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // link to parent category
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = global category
  isGlobal: { type: Boolean, default: false },
});

const SubCategory = mongoose.model("Finance_SubCategory", SubCategorySchema);

// Category model
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isExpense: { type: Boolean, required: true }, // if a category is for expence or income
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  isGlobal: { type: Boolean, default: false },
});

const Category = mongoose.model("Finance_Category", CategorySchema);

module.exports = { Category, SubCategory };
