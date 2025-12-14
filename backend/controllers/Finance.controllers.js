const Finance = require("../models/Finance.models");
const {
  Category,
  SubCategory,
} = require("../models/Finance.Categories.models");
const mongoose = require("mongoose");

const FILE = "Finance.controllers.js";

const createFinance = async (req, res) => {
  const functionName = "createFinance";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Starting create finance`);
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Request body:`, JSON.stringify(req.body));

  try {
    const {
      type,
      when,
      category_id,
      sub_category_id,
      amount,
      note,
      upload_link,
    } = req.body;

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Payload received: type=${type}, when=${when}, category_id=${category_id}, sub_category_id=${sub_category_id}, amount=${amount}`);

    // Validate required category_id
    if (!category_id) {
      console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing category_id`);
      return res.status(400).json({ message: "category_id is required" });
    }

    let category_name = "";
    let sub_category_name = "";

    // Always derive category name from ID
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Category model for id: ${category_id}`);
    const category = await Category.findById(category_id);

    if (!category) {
      console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found: ${category_id}`);
      return res.status(400).json({ message: "Invalid category_id" });
    }

    category_name = category.name;
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category found: ${category.name} (${category._id})`);

    // Derive subcategory name from ID if provided
    if (sub_category_id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying SubCategory model for id: ${sub_category_id}`);
      const subCategory = await SubCategory.findById(sub_category_id);

      if (!subCategory) {
        console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found: ${sub_category_id}`);
        return res.status(400).json({ message: "Invalid sub_category_id" });
      }

      sub_category_name = subCategory.name;
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory found: ${subCategory.name} (${subCategory._id})`);
    }

    const finance = new Finance({
      created_by: req.userId,
      type,
      when,
      category_id,
      category_name,
      sub_category_id: sub_category_id || null,
      sub_category_name,
      amount,
      note,
      upload_link,
    });

    await finance.save();
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created finance id=${finance._id} with category=${category_name} (${category_id}) and subcategory=${sub_category_name || 'none'}`);
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Responding with 201`);
    res.status(201).json(finance);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [createFinance] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to create finance entry" });
  }
};

// Get all finance entries for a user
const getAllFinance = async (req, res) => {
  const functionName = "getAllFinance";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching all finance entries`);
  try {
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Finance model for created_by=${req.userId}`);
    const finances = await Finance.find({ created_by: req.userId })
      .populate({ path: "category_id", model: "Finance_Category" })
      .populate({ path: "sub_category_id", model: "Finance_SubCategory" })
      .sort({ when: -1 });
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${finances.length} finance entries`);
    res.json(finances);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch finance entries" });
  }
};

// Get single finance entry by ID
const getFinanceById = async (req, res) => {
  const functionName = "getFinanceById";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching finance id=${req.params.id}`);
  try {
    const finance = await Finance.findOne({
      _id: req.params.id,
      created_by: req.userId,
    })
      .populate({ path: "category_id", model: "Finance_Category" })
      .populate({ path: "sub_category_id", model: "Finance_SubCategory" });

    if (!finance) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Finance not found id=${req.params.id}`);
      return res.status(404).json({ message: "Finance entry not found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Found finance id=${finance._id}`);
    res.json(finance);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch finance entry" });
  }
};

// Update finance entry
const updateFinance = async (req, res) => {
  const functionName = "updateFinance";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting update for id=${req.params.id}`);
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Request body:`, JSON.stringify(req.body));

  try {
    const { id } = req.params;

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Finance model for id=${id}`);
    const finance = await Finance.findOne({ _id: id, created_by: req.userId });
    if (!finance) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Finance not found id=${id}`);
      return res.status(404).json({ message: "Finance entry not found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Current finance before update:`, {
      category_id: finance.category_id,
      category_name: finance.category_name,
      sub_category_id: finance.sub_category_id,
      sub_category_name: finance.sub_category_name
    });

    // Extract allowed fields from request body
    // IMPORTANT: We don't accept category_name or sub_category_name from frontend
    // These will be derived from the IDs
    const {
      type,
      when,
      amount,
      note,
      upload_link,
      category_id,
      sub_category_id
    } = req.body;

    // Build clean update object with only defined values
    const updates = {};
    if (type !== undefined) updates.type = type;
    if (when !== undefined) updates.when = when;
    if (amount !== undefined) updates.amount = amount;
    if (note !== undefined) updates.note = note;
    if (upload_link !== undefined) updates.upload_link = upload_link;

    // Handle category_id: derive name from ID
    if (category_id !== undefined) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category ID in request: "${category_id}" (type: ${typeof category_id})`);

      if (!category_id) {
        console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Cannot set category_id to null/empty`);
        return res.status(400).json({ message: "category_id cannot be empty" });
      }

      // Check if it's a valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Invalid ObjectId format: ${category_id}`);
        return res.status(400).json({ message: "Invalid category_id format" });
      }

      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Looking up category in Finance_Category collection...`);
      const category = await Category.findById(category_id);

      if (!category) {
        console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category not found in database: ${category_id}`);
        // Log all categories to help debug
        const allCategories = await Category.find({ user: req.userId }).limit(5);
        console.log(`[DEBUG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Sample categories for this user:`, allCategories.map(c => ({ id: c._id, name: c.name })));
        return res.status(400).json({ message: `Invalid category_id: ${category_id} not found` });
      }

      updates.category_id = category_id;
      updates.category_name = category.name;
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Set category: ${category.name} (${category_id})`);
    }

    // Handle sub_category_id: derive name from ID
    // Allow null/empty for subcategory (it's optional)
    if (sub_category_id !== undefined) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory ID in request: ${sub_category_id}`);

      if (sub_category_id === null || sub_category_id === "") {
        // User wants to clear the subcategory
        updates.sub_category_id = null;
        updates.sub_category_name = "";
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Cleared subcategory`);
      } else {
        const subCategory = await SubCategory.findById(sub_category_id);
        if (!subCategory) {
          console.log(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory not found: ${sub_category_id}`);
          return res.status(400).json({ message: "Invalid sub_category_id" });
        }

        updates.sub_category_id = sub_category_id;
        updates.sub_category_name = subCategory.name;
        console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Set subcategory: ${subCategory.name} (${sub_category_id})`);
      }
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Applying updates:`, JSON.stringify(updates));

    // Apply updates
    Object.assign(finance, updates);
    await finance.save();

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated finance id=${finance._id}`);
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Finance after update:`, {
      category_id: finance.category_id,
      category_name: finance.category_name,
      sub_category_id: finance.sub_category_id,
      sub_category_name: finance.sub_category_name
    });

    res.json(finance);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to update finance entry" });
  }
};

// Delete finance entry
const deleteFinance = async (req, res) => {
  const functionName = "deleteFinance";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting finance id=${req.params.id}`);
  try {
    const { id } = req.params;
    const finance = await Finance.findOneAndDelete({
      _id: id,
      created_by: req.userId,
    });

    if (!finance) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Finance not found id=${id}`);
      return res.status(404).json({ message: "Finance entry not found" });
    }

    console.log(`[ACTION] [${req.userId || "unknown"}] deleted finance ${id}`);
    res.json({ message: "Finance entry deleted successfully" });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to delete finance entry" });
  }
};

module.exports = {
  createFinance,
  getAllFinance,
  getFinanceById,
  updateFinance,
  deleteFinance,
};
