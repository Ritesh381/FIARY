const Memory = require("../models/Memories.models");
const upload = require("../config/multer"); // multer + cloudinary setup
const mongoose = require("mongoose");

const FILE = "Memories.controllers.js";

// --- CREATE MEMORY ---
exports.createMemory = async (req, res) => {
  const functionName = "createMemory";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Starting create memory`);
  try {
    const { title, description, date, location, tags } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!userId || !title || !date) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing required fields`);
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
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Created memory id=${savedMemory._id}`);
    res.status(201).json({ success: true, data: savedMemory });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [createMemory] [${req.user?._id || req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: "Failed to create memory", error: err.message });
  }
};

// --- GET ALL MEMORIES (optionally by user) ---
exports.getMemories = async (req, res) => {
  const functionName = "getMemories";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching memories`);
  try {
    const userId = req.userId;

    const filter = { isDeleted: false };
    if (userId) filter.userId = userId;

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Memory model with filter=${JSON.stringify(filter)}`);
    const memories = await Memory.find(filter).sort({ date: -1 });
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${memories.length} memories`);
    res.status(200).json({ success: true, data: memories });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getMemories] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: "Failed to fetch memories" });
  }
};

// --- UPDATE MEMORY ---
exports.updateMemory = async (req, res) => {
  const functionName = "updateMemory";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Starting update for memory id=${req.params.id}`);
  try {
    const { id } = req.params;
    const { title, description, date, location, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Invalid memory ID ${id}`);
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    // If new files uploaded, get their Cloudinary URLs
    const newPhotos = req.files?.map((file) => file.path) || [];

    // Find the existing memory
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Querying Memory.findById id=${id}`);
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
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated memory id=${updatedMemory._id}`);
    res.status(200).json({ success: true, data: updatedMemory });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [updateMemory] [${req.userId || req.user?._id || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: "Failed to update memory", error: err.message });
  }
};

// --- DELETE MEMORY (soft delete) ---
exports.deleteMemory = async (req, res) => {
  const functionName = "deleteMemory";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Deleting memory id=${req.params.id}`);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Invalid memory ID ${id}`);
      return res.status(400).json({ message: "Invalid memory ID" });
    }

    const memory = await Memory.findById(id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });

    memory.isDeleted = true;
    await memory.save();

    console.log(`[ACTION] [${req.userId || "unknown"}] deleted memory ${id}`);
    res.status(200).json({ success: true, message: "Memory deleted successfully" });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [deleteMemory] [${req.userId || req.user?._id || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: "Failed to delete memory", error: err.message });
  }
};
