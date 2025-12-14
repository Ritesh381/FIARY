#!/usr/bin/env node

/**
 * Verification script to test the Finance API fixes
 * 
 * This script tests:
 * 1. Creating entries with categories
 * 2. Updating entries without losing category data
 * 3. Validation of category IDs
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN; // You need to provide this

if (!AUTH_TOKEN) {
    console.error('❌ ERROR: AUTH_TOKEN environment variable is required');
    console.error('Usage: AUTH_TOKEN=your_jwt_token node verify-finance-fix.js');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
};

// Test data
const testEntry = {
    type: 'Expense',
    amount: 100.50,
    when: new Date().toISOString(),
    note: 'Test entry for verification',
};

async function makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return { status: response.status, data };
}

async function runTests() {
    console.log('🧪 Starting Finance API Verification\n');

    let testsPassed = 0;
    let testsFailed = 0;
    let createdEntryId = null;
    let categoryId = null;
    let subCategoryId = null;

    try {
        // Test 1: Get categories
        console.log('📋 Test 1: Fetching categories...');
        const categoriesRes = await makeRequest('/fincat');

        if (categoriesRes.status === 200 && categoriesRes.data.length > 0) {
            categoryId = categoriesRes.data[0]._id;

            // Try to find a subcategory
            for (const cat of categoriesRes.data) {
                if (cat.subcategories && cat.subcategories.length > 0) {
                    subCategoryId = cat.subcategories[0]._id;
                    break;
                }
            }

            console.log(`✅ Found ${categoriesRes.data.length} categories`);
            console.log(`   Using category: ${categoriesRes.data[0].name} (${categoryId})`);
            if (subCategoryId) {
                console.log(`   Using subcategory: ${subCategoryId}`);
            }
            testsPassed++;
        } else {
            console.log('❌ Failed to fetch categories');
            testsFailed++;
            throw new Error('No categories available for testing');
        }

        // Test 2: Create entry WITHOUT category_id (should fail)
        console.log('\n📋 Test 2: Creating entry without category_id (should fail)...');
        const invalidCreateRes = await makeRequest('/finance', 'POST', {
            ...testEntry,
            // category_id is intentionally missing
        });

        if (invalidCreateRes.status === 400) {
            console.log('✅ Correctly rejected entry without category_id');
            console.log(`   Error: ${invalidCreateRes.data.message}`);
            testsPassed++;
        } else {
            console.log('❌ Should have rejected entry without category_id');
            testsFailed++;
        }

        // Test 3: Create entry WITH valid category_id
        console.log('\n📋 Test 3: Creating entry with valid category_id...');
        const createRes = await makeRequest('/finance', 'POST', {
            ...testEntry,
            category_id: categoryId,
            sub_category_id: subCategoryId,
        });

        if (createRes.status === 201) {
            createdEntryId = createRes.data._id;
            console.log('✅ Entry created successfully');
            console.log(`   ID: ${createdEntryId}`);
            console.log(`   Category Name: ${createRes.data.category_name || 'MISSING! ❌'}`);
            console.log(`   Category ID: ${createRes.data.category_id || 'MISSING! ❌'}`);

            if (createRes.data.category_name && createRes.data.category_id) {
                console.log('✅ Category name and ID are both present');
                testsPassed++;
            } else {
                console.log('❌ Category name or ID is missing!');
                testsFailed++;
            }

            if (subCategoryId) {
                console.log(`   Subcategory Name: ${createRes.data.sub_category_name || 'MISSING! ❌'}`);
                console.log(`   Subcategory ID: ${createRes.data.sub_category_id || 'MISSING! ❌'}`);
            }
        } else {
            console.log('❌ Failed to create entry');
            console.log(`   Status: ${createRes.status}`);
            console.log(`   Error: ${JSON.stringify(createRes.data)}`);
            testsFailed++;
        }

        if (!createdEntryId) {
            throw new Error('Failed to create test entry');
        }

        // Test 4: Update entry (change amount only)
        console.log('\n📋 Test 4: Updating entry (amount only)...');
        const updateRes = await makeRequest(`/finance/${createdEntryId}`, 'PUT', {
            amount: 200.75,
            // NOT sending category_id or category_name
        });

        if (updateRes.status === 200) {
            console.log('✅ Entry updated successfully');
            console.log(`   New Amount: ${updateRes.data.amount}`);
            console.log(`   Category Name: ${updateRes.data.category_name || 'MISSING! ❌'}`);
            console.log(`   Category ID: ${updateRes.data.category_id || 'MISSING! ❌'}`);

            if (updateRes.data.category_name && updateRes.data.category_id) {
                console.log('✅ Category name and ID preserved after update');
                testsPassed++;
            } else {
                console.log('❌ Category name or ID lost during update!');
                testsFailed++;
            }
        } else {
            console.log('❌ Failed to update entry');
            testsFailed++;
        }

        // Test 5: Update entry with invalid category_id
        console.log('\n📋 Test 5: Updating entry with invalid category_id (should fail)...');
        const invalidUpdateRes = await makeRequest(`/finance/${createdEntryId}`, 'PUT', {
            category_id: '000000000000000000000000', // Invalid ID
        });

        if (invalidUpdateRes.status === 400) {
            console.log('✅ Correctly rejected invalid category_id');
            console.log(`   Error: ${invalidUpdateRes.data.message}`);
            testsPassed++;
        } else {
            console.log('❌ Should have rejected invalid category_id');
            testsFailed++;
        }

        // Test 6: Update entry with null category_id
        console.log('\n📋 Test 6: Updating entry with null category_id (should fail)...');
        const nullUpdateRes = await makeRequest(`/finance/${createdEntryId}`, 'PUT', {
            category_id: null,
        });

        if (nullUpdateRes.status === 400) {
            console.log('✅ Correctly rejected null category_id');
            console.log(`   Error: ${nullUpdateRes.data.message}`);
            testsPassed++;
        } else {
            console.log('❌ Should have rejected null category_id');
            testsFailed++;
        }

        // Clean up: Delete the test entry
        console.log('\n🧹 Cleaning up...');
        const deleteRes = await makeRequest(`/finance/${createdEntryId}`, 'DELETE');

        if (deleteRes.status === 200) {
            console.log('✅ Test entry deleted');
        } else {
            console.log('⚠️  Warning: Failed to delete test entry');
            console.log(`   You may need to manually delete entry: ${createdEntryId}`);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        testsFailed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed! Finance API is working correctly.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please review the issues above.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
