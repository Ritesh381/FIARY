const Thoughts = require("../models/Thoughts.models");

const FILE = "Thoughts.controllers.js";

// ✅ Create a new thought
const createThought = async (req, res) => {
  const functionName = "createThought";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting create thought`);
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing title or body`);
      return res.status(400).json({ message: "Title and body are required." });
    }

    const thought = new Thoughts({
      createdBy: req.userId,
      title,
      body,
      tags: tags || [],
    });

    await thought.save();
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created thought id=${thought._id}`);
    res.status(201).json(thought);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [createThought] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to create thought." });
  }
};

// ✅ Get all thoughts for user
const getAllThoughts = async (req, res) => {
  const functionName = "getAllThoughts";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching thoughts`);
  try {
    const thoughts = await Thoughts.find({ createdBy: req.userId }).sort({
      createdAt: -1,
    }); // Sort newest first
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${thoughts.length} thoughts`);
    res.json(thoughts);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getAllThoughts] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch thoughts." });
  }
};

// ✅ Update a thought
const updateThought = async (req, res) => {
  const functionName = "updateThought";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating thought id=${req.params.id}`);
  try {
    const { id } = req.params;
    const updates = req.body;

    const thought = await Thoughts.findOneAndUpdate(
      { _id: id, createdBy: req.userId },
      updates,
      { new: true }
    );

    if (!thought) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Thought not found id=${id}`);
      return res.status(404).json({ message: "Thought not found." });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated thought id=${thought._id}`);
    res.json(thought);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [updateThought] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to update thought." });
  }
};

// ✅ Delete a thought
const deleteThought = async (req, res) => {
  const functionName = "deleteThought";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting thought id=${req.params.id}`);
  try {
    const thought = await Thoughts.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!thought) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Thought not found id=${req.params.id}`);
      return res.status(404).json({ message: "Thought not found." });
    }
    console.log(`[ACTION] [${req.userId || "unknown"}] deleted thought ${req.params.id}`);
    res.json({ message: "Thought deleted successfully." });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [deleteThought] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to delete thought." });
  }
};

module.exports = {
  createThought,
  getAllThoughts,
  updateThought,
  deleteThought,
};
