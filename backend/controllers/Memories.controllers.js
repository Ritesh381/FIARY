const Memory = require("../models/Memories.models");
const upload = require("../config/multer"); // multer + cloudinary setup
const mongoose = require("mongoose");

// --- CREATE MEMORY ---
exports.createMemory = async (req, res) => {
  try {
    const { title, description, date, location, tags } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId || !title || !date) {
      return res.status(400).json({ message: "userId, title, and date are required" });
    }

    // Extract Cloudinary URLs from uploaded files
    const photos = req.files?.map((file) => file.path) || [];

    const memory = new Memory({
      userId,
      title,
      description,
      date,
      location,
      tags: tags ? JSON.parse(tags) : [],
      photos,
    });

    const savedMemory = await memory.save();
    res.status(201).json({ success: true, data: savedMemory });
  } catch (err) {
    console.error("Create memory failed:", err);
    res.status(500).json({ success: false, message: "Failed to create memory", error: err.message });
  }
};

// --- GET ALL MEMORIES (optionally by user) ---
exports.getMemories = async (req, res) => {
  try {
    const userId = req.userId;

    const filter = { isDeleted: false };
    if (userId) filter.userId = userId;

    const memories = await Memory.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: memories });
  } catch (err) {
    console.error("Fetch memories failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch memories" });
  }
};

// --- UPDATE MEMORY ---
exports.updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    // If new files uploaded, get their Cloudinary URLs
    const newPhotos = req.files?.map((file) => file.path) || [];

    // Find the existing memory
    const memory = await Memory.findById(id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    // Merge updates
    memory.title = title ?? memory.title;
    memory.description = description ?? memory.description;
    memory.date = date ?? memory.date;
    memory.location = location ?? memory.location;
    memory.tags = tags ? JSON.parse(tags) : memory.tags;
    if (newPhotos.length > 0) {
      memory.photos = [...memory.photos, ...newPhotos];
    }

    const updatedMemory = await memory.save();
    res.status(200).json({ success: true, data: updatedMemory });
  } catch (err) {
    console.error("Update memory failed:", err);
    res.status(500).json({ success: false, message: "Failed to update memory", error: err.message });
  }
};

// --- DELETE MEMORY (soft delete) ---
exports.deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    const memory = await Memory.findById(id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    memory.isDeleted = true;
    await memory.save();

    res.status(200).json({ success: true, message: "Memory deleted successfully" });
  } catch (err) {
    console.error("Delete memory failed:", err);
    res.status(500).json({ success: false, message: "Failed to delete memory", error: err.message });
  }
};
