const mongoose = require("mongoose");

// Template SubCategory - global template items
const TemplateSubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // parent template category
  category: { type: mongoose.Schema.Types.ObjectId, ref: "TemplateCategory" },
});

const TemplateSubCategory = mongoose.model("Template_Finance_SubCategory", TemplateSubCategorySchema);

// Template Category - global template items
const TemplateCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isExpense: { type: Boolean, required: true },
});

const TemplateCategory = mongoose.model("Template_Finance_Category", TemplateCategorySchema);

// User overrides for templates (minimal diffs)
const UserCategoryOverrideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template_Finance_Category", required: true },
  hidden: { type: Boolean, default: false },
  customName: { type: String, default: null },
  // subcategory overrides: { templateSubId, hidden, customName }
  subcategoryOverrides: [
    {
      templateSubId: { type: mongoose.Schema.Types.ObjectId, ref: "Template_Finance_SubCategory" },
      hidden: { type: Boolean, default: false },
      customName: { type: String, default: null },
    },
  ],
});

const UserCategoryOverride = mongoose.model("UserCategoryOverride", UserCategoryOverrideSchema);

module.exports = {
  TemplateCategory,
  TemplateSubCategory,
  UserCategoryOverride,
};
