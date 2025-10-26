const express = require("express");
const categoriesRouter = express.Router();
const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} = require("../controllers/Finance.categories.controller");
const isAuth = require("../middleware/isAuth");

// --- CATEGORIES ROUTES ---
// Fetch all categories (includes user-specific and global categories with subcategories)
categoriesRouter.get("/", isAuth, getCategories); 
// Create a new category
categoriesRouter.post("/", isAuth, createCategory); 
// Update a specific category
categoriesRouter.patch("/:id", isAuth, updateCategory); 
// Delete a specific category (must be user-owned and non-global)
categoriesRouter.delete("/:id", isAuth, deleteCategory); 


// --- SUB-CATEGORIES ROUTES ---
// Create a new subcategory
categoriesRouter.post("/sub", isAuth, createSubCategory); 
// Update a specific subcategory
categoriesRouter.patch("/sub/:id", isAuth, updateSubCategory); 
// Delete a specific subcategory (must be user-owned and non-global)
categoriesRouter.delete("/sub/:id", isAuth, deleteSubCategory); 

module.exports = categoriesRouter;
