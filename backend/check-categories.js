#!/usr/bin/env node

/**
 * Diagnostic script to check categories in the database
 * Run this to see what categories exist and their IDs
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    isExpense: { type: Boolean, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    templateRef: { type: mongoose.Schema.Types.ObjectId, ref: "TemplateCategory", default: null },
});

const Category = mongoose.model("Finance_Category", CategorySchema);

async function checkDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB\n');

        console.log('📋 Fetching all categories...\n');
        const categories = await Category.find({}).limit(20);

        if (categories.length === 0) {
            console.log('⚠️  No categories found in the database!');
            console.log('You may need to create categories first.\n');
        } else {
            console.log(`Found ${categories.length} categories:\n`);
            console.log('┌─────────────────────────────────────────────────────────────────┐');
            console.log('│ Category ID                │ Name              │ Type    │ User ID                 │');
            console.log('├─────────────────────────────────────────────────────────────────┤');

            categories.forEach(cat => {
                const id = cat._id.toString().padEnd(26);
                const name = (cat.name || '').substring(0, 17).padEnd(17);
                const type = (cat.isExpense ? 'Expense' : 'Income').padEnd(7);
                const userId = (cat.user || '').toString().substring(0, 23).padEnd(23);
                console.log(`│ ${id} │ ${name} │ ${type} │ ${userId} │`);
            });

            console.log('└─────────────────────────────────────────────────────────────────┘\n');

            // Group by user
            const userGroups = {};
            categories.forEach(cat => {
                const userId = cat.user.toString();
                if (!userGroups[userId]) {
                    userGroups[userId] = [];
                }
                userGroups[userId].push(cat);
            });

            console.log(`📊 Categories grouped by user:\n`);
            Object.keys(userGroups).forEach(userId => {
                console.log(`User: ${userId}`);
                userGroups[userId].forEach(cat => {
                    console.log(`  - ${cat.name} (${cat.isExpense ? 'Expense' : 'Income'}) - ID: ${cat._id}`);
                });
                console.log('');
            });
        }

        console.log('✅ Diagnosis complete!');
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

checkDatabase();
