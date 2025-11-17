const { Category, SubCategory } = require("../models/Finance.Categories.models");
const { TemplateCategory, TemplateSubCategory, UserCategoryOverride } = require("../models/Template.models");
const mongoose = require("mongoose");

const FILE = "Finance.categories.controller.js";

const getCategoriesWithSubcategories = async (userId) => {
        const functionName = "getCategoriesWithSubcategories";
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Starting merged categories`);
        if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error(`[ERROR] [${FILE}] [${functionName}] [${userId || "unknown"}] Invalid userId`);
                throw new Error("Invalid userId passed to getCategoriesWithSubcategories");
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Fetch templates and their subcategories (avoid hard-coded collection names)
        const templates = await TemplateCategory.find({}).lean();
        const templateSubcategories = await TemplateSubCategory.find({}).lean();
        const templateSubsByCategory = templateSubcategories.reduce((acc, s) => {
            const key = String(s.category);
            if (!acc[key]) acc[key] = [];
            acc[key].push(s);
            return acc;
        }, {});

        // Fetch user-owned categories and subcategories
        const userCategories = await Category.find({ user: userId }).lean();
        const userSubcategories = await SubCategory.find({ user: userId }).lean();

        // Fetch overrides
        const overrides = await UserCategoryOverride.find({ user: userId }).lean();

        // Helper to get subcategories for a user category
        const subByCategory = userSubcategories.reduce((acc, s) => {
            const key = String(s.category);
            if (!acc[key]) acc[key] = [];
            acc[key].push(s);
            return acc;
        }, {});

        const merged = [];

        // Start with templates: apply overrides or user clones
        for (const t of templates) {
            const tplId = String(t._id);

            // If user has a cloned category (templateRef), prefer it
            const cloned = userCategories.find((c) => c.templateRef && String(c.templateRef) === tplId);
            if (cloned) {
                merged.push({
                    _id: cloned._id,
                    name: cloned.name,
                    isExpense: cloned.isExpense,
                    user: cloned.user,
                    subcategories: (subByCategory[String(cloned._id)] || []).map((s) => ({
                        _id: s._id,
                        name: s.name,
                        category: s.category,
                    })),
                });
                continue;
            }

            // Apply override if any
            const ov = overrides.find((o) => String(o.templateId) === tplId);
            if (ov && ov.hidden) continue; // user hid this template

            const catName = (ov && ov.customName) ? ov.customName : t.name;
            const tplSubs = templateSubsByCategory[tplId] || [];
            const subs = tplSubs.map((s) => {
                const so = ov && ov.subcategoryOverrides ? ov.subcategoryOverrides.find(x => String(x.templateSubId) === String(s._id)) : null;
                if (so && so.hidden) return null;
                return {
                    _id: s._id,
                    name: so && so.customName ? so.customName : s.name,
                    category: t._id,
                };
            }).filter(Boolean);

            merged.push({
                _id: t._id,
                template: true,
                name: catName,
                isExpense: t.isExpense,
                subcategories: subs,
            });
        }

        // Append user-created categories that are not clones of templates
        const userOnly = userCategories.filter((c) => !c.templateRef).map((c) => ({
            _id: c._id,
            name: c.name,
            isExpense: c.isExpense,
            user: c.user,
            subcategories: (subByCategory[String(c._id)] || []).map((s) => ({ _id: s._id, name: s.name, category: s.category })),
        }));

        const result = merged.concat(userOnly);
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Merged categories count ${result.length}`);
        return result;
};




// --- CATEGORY CRUD OPERATIONS ---

const createCategory = async (req, res) => {
    const functionName = "createCategory";
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Creating category`);
    try {
        const { name, isExpense } = req.body;
        if (!name || isExpense === undefined) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing name or isExpense`);
            return res.status(400).json({ message: "Name and isExpense are required." });
        }

        const category = new Category({
            name,
            isExpense,
            user: req.userId, // Always user-owned
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
        // If user owns this category, update directly
        let category = await Category.findOne({ _id: id, user: req.userId });
        if (category) {
            if (name) category.name = name;
            if (isExpense !== undefined) category.isExpense = isExpense;
            await category.save();
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated category id=${category._id}`);
            return res.json(category);
        }

        // If not found, maybe it's a template id -> perform clone-on-write
        const tpl = await TemplateCategory.findById(id).lean();
        if (!tpl) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found id=${id}`);
            return res.status(404).json({ message: "Category not found or access denied." });
        }

        // Create user-owned cloned category
        const newCat = new Category({
            name: name || tpl.name,
            isExpense: (isExpense !== undefined) ? isExpense : tpl.isExpense,
            user: req.userId,
            templateRef: tpl._id,
        });
        await newCat.save();

        // Clone template subcategories into user subcategories
        const tplSubs = await TemplateSubCategory.find({ category: tpl._id }).lean();
        if (tplSubs && tplSubs.length) {
            const subDocs = tplSubs.map(s => ({ name: s.name, category: newCat._id, user: req.userId, templateRef: s._id }));
            await SubCategory.insertMany(subDocs);
        }

        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Cloned template category ${tpl._id} to ${newCat._id}`);
        return res.status(201).json(newCat);
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
        // If user owns category, delete it
        const category = await Category.findOne({ _id: id, user: req.userId });
        if (category) {
            await SubCategory.deleteMany({ category: id, user: req.userId });
            await Category.deleteOne({ _id: id });
            console.log(`[ACTION] [${req.userId || "unknown"}] deleted category ${id}`);
            return res.json({ message: "Category and associated subcategories deleted successfully." });
        }

        // If it's a template id, create/update an override to hide it for this user
        const tpl = await TemplateCategory.findById(id);
        if (!tpl) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found id=${id}`);
            return res.status(404).json({ message: "Category not found or access denied." });
        }

        let ov = await UserCategoryOverride.findOne({ user: req.userId, templateId: tpl._id });
        if (!ov) {
            ov = new UserCategoryOverride({ user: req.userId, templateId: tpl._id, hidden: true });
        } else {
            ov.hidden = true;
        }
        await ov.save();
        console.log(`[ACTION] [${req.userId || "unknown"}] hid template category ${id}`);
        return res.json({ message: "Template category hidden for user." });
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
        const { name, categoryId } = req.body;
        if (!name || !categoryId) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing name or categoryId`);
            return res.status(400).json({ message: "Name and Category ID are required." });
        }

        // Verify parent: could be a user category or a template category (clone-on-write)
        let parentCategory = await Category.findOne({ _id: categoryId, user: req.userId });
        if (!parentCategory) {
            // If categoryId refers to a template, clone the template for user
            const tpl = await TemplateCategory.findById(categoryId).lean();
            if (!tpl) {
                console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Parent category not found id=${categoryId}`);
                return res.status(404).json({ message: "Parent category not found or access denied." });
            }

            parentCategory = new Category({ name: tpl.name, isExpense: tpl.isExpense, user: req.userId, templateRef: tpl._id });
            await parentCategory.save();

            // clone template subcategories
            const tplSubs = await TemplateSubCategory.find({ category: tpl._id }).lean();
            if (tplSubs && tplSubs.length) {
                const subDocs = tplSubs.map(s => ({ name: s.name, category: parentCategory._id, user: req.userId, templateRef: s._id }));
                await SubCategory.insertMany(subDocs);
            }
        }

        const subCategory = new SubCategory({ name, category: parentCategory._id, user: req.userId });
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
        // If user owns this subcategory, update directly
        let subCategory = await SubCategory.findOne({ _id: id, user: req.userId });
        if (subCategory) {
            if (name) subCategory.name = name;
            await subCategory.save();
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated subcategory id=${subCategory._id}`);
            return res.json(subCategory);
        }

        // Might be a template subcategory id -> clone parent category if needed and clone this sub
        const tplSub = await TemplateSubCategory.findById(id).lean();
        if (!tplSub) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found id=${id}`);
            return res.status(404).json({ message: "SubCategory not found or access denied." });
        }

        // Ensure user's cloned category exists
        const parentTplId = String(tplSub.category);
        let userCat = await Category.findOne({ templateRef: parentTplId, user: req.userId });
        if (!userCat) {
            // clone template category
            const parentTpl = await TemplateCategory.findById(parentTplId).lean();
            userCat = new Category({ name: parentTpl.name, isExpense: parentTpl.isExpense, user: req.userId, templateRef: parentTpl._id });
            await userCat.save();
            const tplSubs = await TemplateSubCategory.find({ category: parentTpl._id }).lean();
            if (tplSubs && tplSubs.length) {
                const subDocs = tplSubs.map(s => ({ name: s.name, category: userCat._id, user: req.userId, templateRef: s._id }));
                await SubCategory.insertMany(subDocs);
            }
        }

        // Find the newly cloned user subcategory corresponding to tplSub
        const clonedSub = await SubCategory.findOne({ templateRef: tplSub._id, category: userCat._id, user: req.userId });
        if (!clonedSub) {
            // As fallback, create a new sub
            const newSub = new SubCategory({ name: name || tplSub.name, category: userCat._id, user: req.userId, templateRef: tplSub._id });
            await newSub.save();
            return res.json(newSub);
        }

        if (name) clonedSub.name = name;
        await clonedSub.save();
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated cloned subcategory id=${clonedSub._id}`);
        res.json(clonedSub);
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
        // If user owns subcategory, delete it
        const subCategory = await SubCategory.findOne({ _id: id, user: req.userId });
        if (subCategory) {
            await SubCategory.deleteOne({ _id: id });
            console.log(`[ACTION] [${req.userId || "unknown"}] deleted subcategory ${id}`);
            return res.json({ message: "SubCategory deleted successfully." });
        }

        // If it's a template subcategory, add override to hide it
        const tplSub = await TemplateSubCategory.findById(id).lean();
        if (!tplSub) {
            console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found id=${id}`);
            return res.status(404).json({ message: "SubCategory not found or access denied." });
        }

        // Find or create override for parent template
        const parentTplId = String(tplSub.category);
        let ov = await UserCategoryOverride.findOne({ user: req.userId, templateId: parentTplId });
        if (!ov) {
            ov = new UserCategoryOverride({ user: req.userId, templateId: parentTplId, subcategoryOverrides: [{ templateSubId: tplSub._id, hidden: true }] });
        } else {
            ov.subcategoryOverrides = ov.subcategoryOverrides || [];
            const existing = ov.subcategoryOverrides.find(x => String(x.templateSubId) === String(tplSub._id));
            if (existing) existing.hidden = true;
            else ov.subcategoryOverrides.push({ templateSubId: tplSub._id, hidden: true });
        }
        await ov.save();
        console.log(`[ACTION] [${req.userId || "unknown"}] hid template subcategory ${id}`);
        res.json({ message: "Template subcategory hidden for user." });
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
