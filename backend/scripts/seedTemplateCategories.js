/**
 * One-off script to seed the TemplateCategory and TemplateSubCategory collections
 * Usage: node backend/scripts/seedTemplateCategories.js
 */
const mongoose = require("mongoose");
require("dotenv").config();

const { seedTemplateCategories } = require("../lib/initializeFinanceCategories");

const run = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    const res = await seedTemplateCategories();
    console.log("Seed result:", res);
  } catch (err) {
    console.error("Error seeding templates:", err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("DB connection closed.");
  }
};

run();
