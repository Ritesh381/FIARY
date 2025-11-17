const { Category, SubCategory } = require("../models/Finance.Categories.models");
const { TemplateCategory, TemplateSubCategory } = require("../models/Template.models");

// Global template categories that will be cloned for each new user
const GLOBAL_CATEGORY_TEMPLATE = [
  {
    name: "Food 🍔",
    isExpense: true,
    subcategories: [
      "Breakfast 🥐",
      "Lunch 🍱",
      "Dinner 🍲",
      "Snacks 🍿",
      "Beverages ☕",
      "Eating Out 🍽️",
      "Groceries 🛒",
      "Others"
    ]
  },
  {
    name: "Transport 🚗",
    isExpense: true,
    subcategories: [
      "Cab 🚕",
      "Bus 🚌",
      "Vehicle repair 🛠️",
      "Subway 🚇",
      "Gas ⛽",
      "Others"
    ]
  },
  {
    name: "Household 🏠",
    isExpense: true,
    subcategories: [
      "Appliances ⚡",
      "Furniture 🛋️",
      "Kitchen 🍴",
      "Toiletries 🧴",
      "Chandlery 🕯️",
      "Others"
    ]
  },
  {
    name: "Apparel 👗",
    isExpense: true,
    subcategories: [
      "Clothes 👕",
      "Fashion 👜",
      "Haircut 💇‍♂️",
      "Shoes 👟",
      "Others"
    ]
  },
  {
    name: "Education 🎓",
    isExpense: true,
    subcategories: [
      "Stationery ✏️",
      "Books 📚",
      "Academics 📝",
      "Others"
    ]
  },
  {
    name: "Chill 😎",
    isExpense: true,
    subcategories: [
      "Movies 🎬",
      "Trip 🏖️",
      "Shopping 🛍️",
      "Others"
    ]
  },
  {
    name: "Health ❤️",
    isExpense: true,
    subcategories: [
      "Hospital 🏥",
      "Medicine 💊",
      "Self Care 🛀",
      "Others"
    ]
  },
  {
    name: "Useless Things 🫣",
    isExpense: true,
    subcategories: []
  },
  {
    name: "Others 🗂️",
    isExpense: true,
    subcategories: []
  },
  {
    name: "Salary 💰",
    isExpense: false,
    subcategories: [
      "Monthly Salary",
      "Bonus",
      "Other Allowances"
    ]
  },
  {
    name: "Investments 📈",
    isExpense: false,
    subcategories: [
      "Stocks",
      "Mutual Funds",
      "Dividends",
      "Others"
    ]
  },
  {
    name: "Gifts & Rewards 🎁",
    isExpense: false,
    subcategories: [
      "Cash Gifts",
      "Reward Points",
      "Other Gifts"
    ]
  },
  {
    name: "Freelance / Side Hustle 💻",
    isExpense: false,
    subcategories: [
      "Projects",
      "Consulting",
      "Other Side Income"
    ]
  }
];

/**
 * Initialize default finance categories for a new user
 * Clones the global template categories into user-specific categories
 * @param {String} userId - The user's ID
 * @returns {Promise<Object>} - Object containing created categories and subcategories count
 */
const createFinCat = async (userId) => {
  const functionName = "createFinCat";
  const FILE = "initializeFinanceCategories.js";
  
  console.log(`[LOG] [${FILE}] [${functionName}] [${userId}] Starting finance category initialization`);

  try {
    // Check if user already has categories
    const existingCategories = await Category.find({ user: userId });
    if (existingCategories.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId}] User already has ${existingCategories.length} categories, skipping initialization`);
      return {
        success: true,
        message: "Categories already initialized",
        categoriesCount: existingCategories.length
      };
    }

    let categoriesCreated = 0;
    let subcategoriesCreated = 0;

    // Clone each template category for the user
    for (const template of GLOBAL_CATEGORY_TEMPLATE) {
      // Create the category
      const category = new Category({
        name: template.name,
        isExpense: template.isExpense,
        user: userId
      });
      
      await category.save();
      categoriesCreated++;

      // Create subcategories if any
      if (template.subcategories && template.subcategories.length > 0) {
        const subcategoryDocs = template.subcategories.map(subName => ({
          name: subName,
          category: category._id,
          user: userId
        }));

        await SubCategory.insertMany(subcategoryDocs);
        subcategoriesCreated += subcategoryDocs.length;
      }
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId}] Successfully created ${categoriesCreated} categories and ${subcategoriesCreated} subcategories`);

    return {
      success: true,
      message: "Finance categories initialized successfully",
      categoriesCount: categoriesCreated,
      subcategoriesCount: subcategoriesCreated
    };

  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${userId}]`, error.stack || error);
    throw new Error(`Failed to initialize finance categories: ${error.message}`);
  }
};

// Seed template categories into TemplateCategory collection if empty
const seedTemplateCategories = async () => {
  const existing = await TemplateCategory.countDocuments();
  if (existing > 0) {
    return { success: true, message: "Templates already seeded", count: existing };
  }

  let catCount = 0;
  let subCount = 0;
  for (const tpl of GLOBAL_CATEGORY_TEMPLATE) {
    const cat = new TemplateCategory({ name: tpl.name, isExpense: tpl.isExpense });
    await cat.save();
    catCount++;
    if (tpl.subcategories && tpl.subcategories.length) {
      const subs = tpl.subcategories.map((s) => ({ name: s, category: cat._id }));
      await TemplateSubCategory.insertMany(subs);
      subCount += subs.length;
    }
  }

  return { success: true, message: "Templates seeded", categories: catCount, subcategories: subCount };
};

module.exports = { createFinCat, GLOBAL_CATEGORY_TEMPLATE, seedTemplateCategories };
