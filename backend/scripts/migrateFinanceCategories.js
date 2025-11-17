/**
 * Migration Script: Initialize Finance Categories for Existing Users
 * 
 * This script finds all users who don't have finance categories yet
 * and initializes them with the default category template.
 * 
 * Run this script once after deploying the new category system.
 * 
 * Usage: node migrateFinanceCategories.js
 */

const mongoose = require("mongoose");
const User = require("../models/User.models");
const { createFinCat } = require("../lib/initializeFinanceCategories");

// Load environment variables
require("dotenv").config();

const migrateFinanceCategories = async () => {
  try {
    console.log("=== Finance Category Migration Started ===\n");

    // Connect to database
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to database\n");

    // Get all users
    const users = await User.find({}, { _id: 1, email: 1, name: 1 });
    console.log(`Found ${users.length} users in the database\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Initialize categories for each user
    for (const user of users) {
      try {
        console.log(`Processing user: ${user.email} (${user._id})...`);
        const result = await createFinCat(user._id);
        
        if (result.categoriesCount > 0) {
          console.log(`  ✓ Initialized ${result.categoriesCount} categories and ${result.subcategoriesCount} subcategories`);
          successCount++;
        } else {
          console.log(`  ⊘ User already has categories, skipped`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`  ✗ Error for user ${user.email}:`, error.message);
        errorCount++;
      }
      console.log(""); // Empty line for readability
    }

    // Summary
    console.log("\n=== Migration Summary ===");
    console.log(`Total users processed: ${users.length}`);
    console.log(`Successfully initialized: ${successCount}`);
    console.log(`Skipped (already had categories): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("\n=== Migration Complete ===");

  } catch (error) {
    console.error("\n=== Migration Failed ===");
    console.error("Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

// Run migration
migrateFinanceCategories();
