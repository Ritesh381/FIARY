const Finance = require("../models/Finance"); // your Finance model
const { Category, SubCategory } = require("../models/Category"); // destructured import

// Create a new finance entry
const createFinance = async (req, res) => {
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

    let category_name = "";
    let sub_category_name = "";

    if (category_id) {
      const category = await Category.findById(category_id);
      if (category) category_name = category.name;
    }

    if (sub_category_id) {
      const subCategory = await SubCategory.findById(sub_category_id);
      if (subCategory) sub_category_name = subCategory.name;
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
    res.status(201).json(finance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create finance entry" });
  }
};

// Get all finance entries for a user
const getAllFinance = async (req, res) => {
  try {
    const finances = await Finance.find({ created_by: req.userId })
      .populate("category_id", "name")
      .populate("sub_category_id", "name")
      .sort({ when: -1 });
    res.json(finances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch finance entries" });
  }
};

// Get single finance entry by ID
const getFinanceById = async (req, res) => {
  try {
    const finance = await Finance.findOne({
      _id: req.params.id,
      created_by: req.userId,
    })
      .populate("category_id", "name")
      .populate("sub_category_id", "name");

    if (!finance)
      return res.status(404).json({ message: "Finance entry not found" });

    res.json(finance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch finance entry" });
  }
};

// Update finance entry
const updateFinance = async (req, res) => {
  try {
    const { id } = req.params;

    const finance = await Finance.findOne({ _id: id, created_by: req.userId });
    if (!finance)
      return res.status(404).json({ message: "Finance entry not found" });

    const updates = req.body;

    // If category or subcategory is updated, update backup names
    if (updates.category_id) {
      const category = await Category.findById(updates.category_id);
      updates.category_name = category ? category.name : "";
    }

    if (updates.sub_category_id) {
      const subCategory = await SubCategory.findById(updates.sub_category_id);
      updates.sub_category_name = subCategory ? subCategory.name : "";
    }

    Object.assign(finance, updates);
    await finance.save();

    res.json(finance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update finance entry" });
  }
};

// Delete finance entry
const deleteFinance = async (req, res) => {
  try {
    const { id } = req.params;
    const finance = await Finance.findOneAndDelete({
      _id: id,
      created_by: req.userId,
    });

    if (!finance)
      return res.status(404).json({ message: "Finance entry not found" });

    res.json({ message: "Finance entry deleted successfully" });
  } catch (err) {
    console.error(err);
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
