const { Category, SubCategory } = require("../models/Finance.Categories.models");
const mongoose = require("mongoose");

const getCategoriesWithSubcategories = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
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

  return categories;
};




// --- CATEGORY CRUD OPERATIONS ---

const createCategory = async (req, res) => {
    try {
        const { name, isExpense, isGlobal = false } = req.body;
        if (!name || isExpense === undefined) {
            return res.status(400).json({ message: "Name and isExpense are required." });
        }

        const category = new Category({
            name,
            isExpense,
            user: isGlobal ? null : req.userId,
            isGlobal: isGlobal,
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ message: "Failed to create category." });
    }
};

const getCategories = async (req, res) => {
    try {
        // Use the aggregation helper for a full list including subcategories
        const categories = await getCategoriesWithSubcategories(req.userId);
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Failed to fetch categories." });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isExpense } = req.body;

        const category = await Category.findOne({ _id: id, $or: [{ user: req.userId }, { isGlobal: true }] });

        if (!category) {
            return res.status(404).json({ message: "Category not found or access denied." });
        }
        if (!category.isGlobal && category.user.toString() !== req.userId) {
             return res.status(403).json({ message: "Permission denied to update this category." });
        }
        // Only allow updating name and isExpense
        if (name) category.name = name;
        if (isExpense !== undefined) category.isExpense = isExpense;

        await category.save();
        res.json(category);
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ message: "Failed to update category." });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({ message: "Category not found." });
        }

        // Must be non-global and owned by the user to delete
        if (category.isGlobal || category.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Cannot delete global or unowned categories." });
        }

        // Delete associated subcategories first
        await SubCategory.deleteMany({ category: id, user: req.userId });
        await Category.deleteOne({ _id: id });

        res.json({ message: "Category and associated subcategories deleted successfully." });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Failed to delete category." });
    }
};


// --- SUB-CATEGORY CRUD OPERATIONS ---

const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId, isGlobal = false } = req.body;
        if (!name || !categoryId) {
            return res.status(400).json({ message: "Name and Category ID are required." });
        }

        // Verify the parent category exists and is accessible
        const parentCategory = await Category.findOne({ _id: categoryId, $or: [{ user: req.userId }, { isGlobal: true }] });
        if (!parentCategory) {
            return res.status(404).json({ message: "Parent category not found or access denied." });
        }

        const subCategory = new SubCategory({
            name,
            category: categoryId,
            user: isGlobal ? null : req.userId,
            isGlobal: isGlobal,
        });

        await subCategory.save();
        res.status(201).json(subCategory);
    } catch (err) {
        console.error("Error creating subcategory:", err);
        res.status(500).json({ message: "Failed to create subcategory." });
    }
};

const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const subCategory = await SubCategory.findOne({ _id: id, $or: [{ user: req.userId }, { isGlobal: true }] });
        
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found or access denied." });
        }
        if (!subCategory.isGlobal && subCategory.user.toString() !== req.userId) {
             return res.status(403).json({ message: "Permission denied to update this subcategory." });
        }

        if (name) subCategory.name = name;

        await subCategory.save();
        res.json(subCategory);
    } catch (err) {
        console.error("Error updating subcategory:", err);
        res.status(500).json({ message: "Failed to update subcategory." });
    }
};

const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await SubCategory.findOne({ _id: id });

        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found." });
        }

        // Must be non-global and owned by the user to delete
        if (subCategory.isGlobal || subCategory.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Cannot delete global or unowned subcategories." });
        }

        await SubCategory.deleteOne({ _id: id });
        res.json({ message: "SubCategory deleted successfully." });
    } catch (err) {
        console.error("Error deleting subcategory:", err);
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
