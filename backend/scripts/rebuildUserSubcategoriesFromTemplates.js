/**
 * Rebuild missing user subcategories for categories that reference templates.
 *
 * For every `Finance_Category` document that has a `templateRef`, this script checks
 * whether there are any `Finance_SubCategory` rows for that category. If none exist
 * it clones the corresponding `Template_Finance_SubCategory` documents into
 * `Finance_SubCategory` (preserving `templateRef` and `user`).
 *
 * Usage: node backend/scripts/rebuildUserSubcategoriesFromTemplates.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const { Category, SubCategory } = require("../models/Finance.Categories.models");
const { TemplateSubCategory } = require("../models/Template.models");

const run = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Find categories that reference a template
    const templatedCats = await Category.find({ templateRef: { $ne: null } }).lean();
    console.log(`Found ${templatedCats.length} user categories referencing templates`);

    let created = 0;
    for (const cat of templatedCats) {
      const existingSubs = await SubCategory.countDocuments({ category: cat._id, user: cat.user });
      if (existingSubs > 0) {
        console.log(` - Category ${cat._id} already has ${existingSubs} subcategories; skipping`);
        continue;
      }

      // Get template subcategories for the referenced template
      const tplSubs = await TemplateSubCategory.find({ category: cat.templateRef }).lean();
      if (!tplSubs || tplSubs.length === 0) {
        console.log(` - No template subcategories found for template ${cat.templateRef}; skipping`);
        continue;
      }

      const docs = tplSubs.map(s => ({
        name: s.name,
        category: cat._id,
        user: cat.user,
        templateRef: s._id,
      }));

      const res = await SubCategory.insertMany(docs);
      created += res.length;
      console.log(` - Created ${res.length} subcategories for category ${cat._id}`);
    }

    console.log(`Done. Created ${created} subcategories total.`);
  } catch (err) {
    console.error("Error rebuilding subcategories:", err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("DB connection closed.");
  }
};

run();
