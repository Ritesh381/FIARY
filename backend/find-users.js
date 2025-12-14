#!/usr/bin/env node

/**
 * Script to find user IDs in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    username: String,
});

const User = mongoose.model("User", UserSchema);

async function findUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('👥 Fetching all users...\n');
        const users = await User.find({}).limit(20);

        if (users.length === 0) {
            console.log('⚠️  No users found in the database!');
        } else {
            console.log(`Found ${users.length} users:\n`);
            console.log('┌─────────────────────────────────────────────────────────────┐');
            console.log('│ User ID                  │ Username/Email                   │');
            console.log('├─────────────────────────────────────────────────────────────┤');

            users.forEach(user => {
                const id = user._id.toString().padEnd(24);
                const identifier = (user.username || user.email || user.name || 'N/A').substring(0, 32).padEnd(32);
                console.log(`│ ${id} │ ${identifier} │`);
            });

            console.log('└─────────────────────────────────────────────────────────────┘\n');

            console.log('📝 To initialize categories for a user, run:');
            console.log(`   node initialize-categories.js ${users[0]._id}`);
        }

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

findUsers();
