require("dotenv").config();
const mongoose = require("mongoose");
const { Category, SubCategory } = require("./models/Finance.Categories.models");
const db = require("./config/db");

async function insertGlobalData() {
  try {
    await db(); // connect to MongoDB
    console.log("Connected to DB");

    const categoriesData = [
      {
        name: "Food 🍔",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Breakfast 🥐", "Lunch 🍱", "Dinner 🍲", "Snacks 🍿", "Beverages ☕", "Eating Out 🍽️", "Groceries 🛒", "Others"]
      },
      {
        name: "Transport 🚗",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Cab 🚕", "Bus 🚌", "Vehicle repair 🛠️", "Subway 🚇", "Gas ⛽", "Others"]
      },
      {
        name: "Household 🏠",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Appliances ⚡", "Furniture 🛋️", "Kitchen 🍴", "Toiletries 🧴", "Chandlery 🕯️", "Others"]
      },
      {
        name: "Apparel 👗",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Clothes 👕", "Fashion 👜", "Haircut 💇‍♂️", "Shoes 👟", "Others"]
      },
      {
        name: "Education 🎓",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Stationery ✏️", "Books 📚", "Academics 📝", "Others"]
      },
      {
        name: "Chill 😎",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Movies 🎬", "Trip 🏖️", "Shopping 🛍️", "Others"]
      },
      {
        name: "Health ❤️",
        isExpense: true,
        isGlobal: true,
        subcategories: ["Hospital 🏥", "Medicine 💊", "Self Care 🛀", "Others"]
      },
      {
        name: "Useless Things 🫣",
        isExpense: true,
        isGlobal: true,
        subcategories: []
      },
      {
        name: "Others 🗂️",
        isExpense: true,
        isGlobal: true,
        subcategories: []
      },

      // Income categories
      {
        name: "Salary 💰",
        isExpense: false,
        isGlobal: true,
        subcategories: ["Monthly Salary", "Bonus", "Other Allowances"]
      },
      {
        name: "Investments 📈",
        isExpense: false,
        isGlobal: true,
        subcategories: ["Stocks", "Mutual Funds", "Dividends", "Others"]
      },
      {
        name: "Gifts & Rewards 🎁",
        isExpense: false,
        isGlobal: true,
        subcategories: ["Cash Gifts", "Reward Points", "Other Gifts"]
      },
      {
        name: "Freelance / Side Hustle 💻",
        isExpense: false,
        isGlobal: true,
        subcategories: ["Projects", "Consulting", "Other Side Income"]
      }
    ];

    for (const cat of categoriesData) {
      const category = new Category({
        name: cat.name,
        isExpense: cat.isExpense,
        isGlobal: cat.isGlobal
      });
      const savedCategory = await category.save();

      for (const subName of cat.subcategories) {
        const sub = new SubCategory({
          name: subName,
          category: savedCategory._id,
          isGlobal: true
        });
        await sub.save();
      }
    }

    console.log("Global categories and subcategories inserted!");
    process.exit(0);
  } catch (err) {
    console.error("Error inserting data:", err);
    process.exit(1);
  }
}

insertGlobalData();
