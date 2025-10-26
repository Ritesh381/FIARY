const Thoughts = require("../models/Thoughts.models");

// ✅ Create a new thought
const createThought = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }

    const thought = new Thoughts({
      createdBy: req.userId,
      title,
      body,
      tags: tags || [],
    });

    await thought.save();
    res.status(201).json(thought);
  } catch (err) {
    console.error("Error creating thought:", err);
    res.status(500).json({ message: "Failed to create thought." });
  }
};

// ✅ Get all thoughts for user
const getAllThoughts = async (req, res) => {
  try {
    const thoughts = await Thoughts.find({ createdBy: req.userId }).sort({
      createdAt: -1,
    }); // Sort newest first
    res.json(thoughts);
  } catch (err) {
    console.error("Error fetching thoughts:", err);
    res.status(500).json({ message: "Failed to fetch thoughts." });
  }
};

// ✅ Update a thought
const updateThought = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, createdBy: req.userId },
      updates,
      { new: true }
    );

    if (!thought) {
      return res.status(404).json({ message: "Thought not found." });
    }
    res.json(thought);
  } catch (err) {
    console.error("Error updating thought:", err);
    res.status(500).json({ message: "Failed to update thought." });
  }
};

// ✅ Delete a thought
const deleteThought = async (req, res) => {
  try {
    const thought = await Thoughts.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!thought) {
      return res.status(404).json({ message: "Thought not found." });
    }
    res.json({ message: "Thought deleted successfully." });
  } catch (err) {
    console.error("Error deleting thought:", err);
    res.status(500).json({ message: "Failed to delete thought." });
  }
};

module.exports = {
  createThought,
  getAllThoughts,
  updateThought,
  deleteThought,
};
