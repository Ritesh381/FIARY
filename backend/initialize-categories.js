#!/usr/bin/env node

/**
 * Script to initialize default finance categories for a user
 * Run this after setting up a new user
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    isExpense: { type: Boolean, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    templateRef: { type: mongoose.Schema.Types.ObjectId, ref: "TemplateCategory", default: null },
});

const SubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    templateRef: { type: mongoose.Schema.Types.ObjectId, ref: "Template_Finance_SubCategory", default: null },
});

const Category = mongoose.model("Finance_Category", CategorySchema);
const SubCategory = mongoose.model("Finance_SubCategory", SubCategorySchema);

// Default categories to create
const DEFAULT_EXPENSE_CATEGORIES = [
    {
        name: "Food & Dining",
        isExpense: true,
        subcategories: ["Groceries", "Restaurants", "Snacks", "Coffee"]
    },
    {
        name: "Transportation",
        isExpense: true,
        subcategories: ["Fuel", "Public Transport", "Taxi/Uber", "Parking"]
    },
    {
        name: "Shopping",
        isExpense: true,
        subcategories: ["Clothing", "Electronics", "Home", "Personal Care"]
    },
    {
        name: "Entertainment",
        isExpense: true,
        subcategories: ["Movies", "Games", "Sports", "Hobbies"]
    },
    {
        name: "Bills & Utilities",
        isExpense: true,
        subcategories: ["Electricity", "Water", "Internet", "Phone", "Rent"]
    },
    {
        name: "Healthcare",
        isExpense: true,
        subcategories: ["Doctor", "Medicine", "Pharmacy", "Insurance"]
    },
    {
        name: "Education",
        isExpense: true,
        subcategories: ["Books", "Courses", "Tuition", "Supplies"]
    },
    {
        name: "Others",
        isExpense: true,
        subcategories: ["Gifts", "Donations", "Miscellaneous"]
    }
];

const DEFAULT_INCOME_CATEGORIES = [
    {
        name: "Salary",
        isExpense: false,
        subcategories: ["Monthly Salary", "Bonus", "Overtime"]
    },
    {
        name: "Business",
        isExpense: false,
        subcategories: ["Sales", "Freelance", "Commission"]
    },
    {
        name: "Investments",
        isExpense: false,
        subcategories: ["Dividends", "Interest", "Capital Gains"]
    },
    {
        name: "Other Income",
        isExpense: false,
        subcategories: ["Gifts", "Refunds", "Cashback"]
    }
];

async function initializeCategories(userId) {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if user already has categories
        const existingCategories = await Category.find({ user: userId });
        if (existingCategories.length > 0) {
            console.log(`⚠️  User ${userId} already has ${existingCategories.length} categories.`);
            console.log('Skipping initialization to avoid duplicates.\n');

            const choice = await askQuestion('Do you want to delete existing categories and reinitialize? (yes/no): ');
            if (choice.toLowerCase() !== 'yes') {
                console.log('Aborting...');
                await mongoose.connection.close();
                process.exit(0);
            }

            // Delete existing categories
            await Category.deleteMany({ user: userId });
            await SubCategory.deleteMany({ user: userId });
            console.log('✅ Deleted existing categories\n');
        }

        console.log(`🎯 Creating default categories for user: ${userId}\n`);

        const allCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
        let totalCategories = 0;
        let totalSubcategories = 0;

        for (const catData of allCategories) {
            // Create the category
            const category = new Category({
                name: catData.name,
                isExpense: catData.isExpense,
                user: userId,
            });

            await category.save();
            totalCategories++;
            console.log(`✅ Created category: ${catData.name} (${catData.isExpense ? 'Expense' : 'Income'})`);
            console.log(`   ID: ${category._id}`);

            // Create subcategories
            if (catData.subcategories && catData.subcategories.length > 0) {
                for (const subName of catData.subcategories) {
                    const subcategory = new SubCategory({
                        name: subName,
                        category: category._id,
                        user: userId,
                    });

                    await subcategory.save();
                    totalSubcategories++;
                    console.log(`   └─ ${subName}`);
                }
            }
            console.log('');
        }

        console.log('═══════════════════════════════════════════════════');
        console.log(`🎉 Initialization complete!`);
        console.log(`   Created ${totalCategories} categories`);
        console.log(`   Created ${totalSubcategories} subcategories`);
        console.log('═══════════════════════════════════════════════════\n');

        console.log('You can now use these categories in the Finance module! 🚀');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

function askQuestion(query) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => readline.question(query, ans => {
        readline.close();
        resolve(ans);
    }));
}

// Main execution
async function main() {
    const userId = process.argv[2];

    if (!userId) {
        console.error('❌ Error: User ID is required');
        console.error('Usage: node initialize-categories.js <USER_ID>');
        console.error('Example: node initialize-categories.js 507f1f77bcf86cd799439011');
        console.error('\nTo find your user ID:');
        console.error('  1. Log in to your app');
        console.error('  2. Check the MongoDB users collection');
        console.error('  3. Or use: mongosh -> use fiary_db -> db.users.findOne()');
        process.exit(1);
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('❌ Error: Invalid User ID format');
        console.error('Please provide a valid MongoDB ObjectId');
        process.exit(1);
    }

    await initializeCategories(userId);
}

main();
