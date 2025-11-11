const { Category, SubCategory } = require("../models/Finance.Categories.models");
const mongoose = require("mongoose");

const FILE = "Finance.categories.controller.js";

const getCategoriesWithSubcategories = async (userId) => {
    const functionName = "getCategoriesWithSubcategories";
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Starting aggregation`);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`[ERROR] [${FILE}] [${functionName}] [${userId || "unknown"}] Invalid userId`);
        throw new Error("Invalid userId passed to getCategoriesWithSubcategories");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

  const categories = await Category.aggregate([
    {
      $match: {
        $or: [
          { isGlobal: true },
          { user: userObjectId }
        ]
      }
    },
    {
      $lookup: {
        from: "finance_subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subcategories"
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        isExpense: 1,
        isGlobal: 1,
        subcategories: {
          $filter: {
            input: "$subcategories",
            as: "sub",
            cond: {
              $or: [
                { $eq: ["$$sub.isGlobal", true] },
                { $eq: ["$$sub.user", userObjectId] }
              ]
            }
          }
        }
      }
    }
  ]);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Aggregation returned ${categories.length} categories`);
    return categories;
};




// --- CATEGORY CRUD OPERATIONS ---

const createCategory = async (req, res) => {
    const functionName = "createCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Creating category`);
    try {
        const { name, isExpense, isGlobal = false } = req.body;
        if (!name || isExpense === undefined) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing name or isExpense`);
            return res.status(400).json({ message: "Name and isExpense are required." });
        }

        const category = new Category({
            name,
            isExpense,
            user: isGlobal ? null : req.userId,
            isGlobal: isGlobal,
        });

        await category.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created category id=${category._id}`);
        res.status(201).json(category);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [createCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to create category." });
    }
};

const getCategories = async (req, res) => {
    const functionName = "getCategories";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching categories`);
    try {
        // Use the aggregation helper for a full list including subcategories
        const categories = await getCategoriesWithSubcategories(req.userId);
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Returning ${categories.length} categories`);
        res.json(categories);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [getCategories] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to fetch categories." });
    }
};

const updateCategory = async (req, res) => {
    const functionName = "updateCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating category id=${req.params.id}`);
    try {
        const { id } = req.params;
        const { name, isExpense } = req.body;

        const category = await Category.findOne({ _id: id, $or: [{ user: req.userId }, { isGlobal: true }] });

        if (!category) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found or access denied id=${id}`);
            return res.status(404).json({ message: "Category not found or access denied." });
        }
        if (!category.isGlobal && category.user.toString() !== req.userId) {
             console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Permission denied to update category id=${id}`);
             return res.status(403).json({ message: "Permission denied to update this category." });
        }
        // Only allow updating name and isExpense
        if (name) category.name = name;
        if (isExpense !== undefined) category.isExpense = isExpense;

        await category.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated category id=${category._id}`);
        res.json(category);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [updateCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to update category." });
    }
};

const deleteCategory = async (req, res) => {
    const functionName = "deleteCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting category id=${req.params.id}`);
    try {
        const { id } = req.params;
        const category = await Category.findOne({ _id: id });

        if (!category) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found id=${id}`);
            return res.status(404).json({ message: "Category not found." });
        }

        // Must be non-global and owned by the user to delete
        if (category.isGlobal || category.user.toString() !== req.userId) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Cannot delete global or unowned category id=${id}`);
            return res.status(403).json({ message: "Cannot delete global or unowned categories." });
        }

        // Delete associated subcategories first
        await SubCategory.deleteMany({ category: id, user: req.userId });
        await Category.deleteOne({ _id: id });

        console.log(`[ACTION] [${req.userId || "unknown"}] deleted category ${id}`);
        res.json({ message: "Category and associated subcategories deleted successfully." });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [deleteCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to delete category." });
    }
};


// --- SUB-CATEGORY CRUD OPERATIONS ---

const createSubCategory = async (req, res) => {
    const functionName = "createSubCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Creating subcategory`);
    try {
        const { name, categoryId, isGlobal = false } = req.body;
        if (!name || !categoryId) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing name or categoryId`);
            return res.status(400).json({ message: "Name and Category ID are required." });
        }

        // Verify the parent category exists and is accessible
        const parentCategory = await Category.findOne({ _id: categoryId, $or: [{ user: req.userId }, { isGlobal: true }] });
        if (!parentCategory) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Parent category not found or access denied id=${categoryId}`);
            return res.status(404).json({ message: "Parent category not found or access denied." });
        }

        const subCategory = new SubCategory({
            name,
            category: categoryId,
            user: isGlobal ? null : req.userId,
            isGlobal: isGlobal,
        });

        await subCategory.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created subcategory id=${subCategory._id}`);
        res.status(201).json(subCategory);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [createSubCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to create subcategory." });
    }
};

const updateSubCategory = async (req, res) => {
    const functionName = "updateSubCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating subcategory id=${req.params.id}`);
    try {
        const { id } = req.params;
        const { name } = req.body;

        const subCategory = await SubCategory.findOne({ _id: id, $or: [{ user: req.userId }, { isGlobal: true }] });
        
        if (!subCategory) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found or access denied id=${id}`);
            return res.status(404).json({ message: "SubCategory not found or access denied." });
        }
        if (!subCategory.isGlobal && subCategory.user.toString() !== req.userId) {
             console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Permission denied to update subcategory id=${id}`);
             return res.status(403).json({ message: "Permission denied to update this subcategory." });
        }

        if (name) subCategory.name = name;

        await subCategory.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated subcategory id=${subCategory._id}`);
        res.json(subCategory);
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [updateSubCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to update subcategory." });
    }
};

const deleteSubCategory = async (req, res) => {
    const functionName = "deleteSubCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting subcategory id=${req.params.id}`);
    try {
        const { id } = req.params;
        const subCategory = await SubCategory.findOne({ _id: id });

        if (!subCategory) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found id=${id}`);
            return res.status(404).json({ message: "SubCategory not found." });
        }

        // Must be non-global and owned by the user to delete
        if (subCategory.isGlobal || subCategory.user.toString() !== req.userId) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Cannot delete global or unowned subcategory id=${id}`);
            return res.status(403).json({ message: "Cannot delete global or unowned subcategories." });
        }

        await SubCategory.deleteOne({ _id: id });
        console.log(`[ACTION] [${req.userId || "unknown"}] deleted subcategory ${id}`);
        res.json({ message: "SubCategory deleted successfully." });
    } catch (err) {
        console.error(`[ERROR] [${FILE}] [deleteSubCategory] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
        res.status(500).json({ message: "Failed to delete subcategory." });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getCategoriesWithSubcategories,
};
