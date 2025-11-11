const Finance = require("../models/Finance.models");
const {
  Category,
  SubCategory,
} = require("../models/Finance.Categories.models");

const FILE = "Finance.controllers.js";

const createFinance = async (req, res) => {
  const functionName = "createFinance";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Starting create finance`);
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

    let category_name = "";
    let sub_category_name = "";

    if (category_id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Category model for id: ${category_id}`);
      const category = await Category.findById(category_id);
      if (category) category_name = category.name;
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Category lookup result: ${category ? category._id : "not found"}`);
    }

    if (sub_category_id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying SubCategory model for id: ${sub_category_id}`);
      const subCategory = await SubCategory.findById(sub_category_id);
      if (subCategory) sub_category_name = subCategory.name;
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] SubCategory lookup result: ${subCategory ? subCategory._id : "not found"}`);
    }

    const finance = new Finance({
      created_by: req.userId,
      type,
      when,
      category_id,
      category_name,
      sub_category_id,
      sub_category_name,
      amount,
      note,
      upload_link,
    });

    await finance.save();
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created finance id=${finance._id}`);
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
  try {
    const { id } = req.params;

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Finance model for id=${id}`);
    const finance = await Finance.findOne({ _id: id, created_by: req.userId });
    if (!finance) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Finance not found id=${id}`);
      return res.status(404).json({ message: "Finance entry not found" });
    }

    const updates = req.body;

    // If category or subcategory is updated, update backup names
    if (updates.category_id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Looking up new category ${updates.category_id}`);
      const category = await Category.findById(updates.category_id);
      updates.category_name = category ? category.name : "";
    }

    if (updates.sub_category_id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Looking up new subcategory ${updates.sub_category_id}`);
      const subCategory = await SubCategory.findById(updates.sub_category_id);
      updates.sub_category_name = subCategory ? subCategory.name : "";
    }

    Object.assign(finance, updates);
    await finance.save();

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated finance id=${finance._id}`);
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
