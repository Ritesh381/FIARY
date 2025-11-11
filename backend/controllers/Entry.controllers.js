const mongoose = require("mongoose")
const Entry = require("../models/Entry.models.js");
const {HabitEntry} = require("../models/Habit.models.js")

const FILE = "Entry.controllers.js";

const saveEntry = async (req, res) => {
  const functionName = "saveEntry";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Received request to save new entry`);
  try {
    const { userId } = req;
    const {
      date,
      feelingScore,
      achievement = "",
      timeWastedMinutes,
      timeWastedNotes = "",
      sleepHours,
      sleepNotes = "",
      diaryEntry,
    } = req.body;

    // validation
    if (
      !date ||
      !feelingScore ||
      timeWastedMinutes === undefined ||
      sleepHours === undefined ||
      !diaryEntry
    ) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Validation failed: required fields missing`);
      return res.status(400).json({
        message:
          "date, feelingScore, timeWastedMinutes, sleepHours, and diaryEntry are required",
      });
    }

    const newEntry = {
      user: userId,
      date,
      feelingScore,
      achievement,
      timeWastedMinutes,
      timeWastedNotes,
      sleepHours,
      sleepNotes,
      diaryEntry,
    };

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Inserting Entry into DB`);
    const createdEntry = await Entry.create(newEntry);
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Successfully saved new entry with ID: ${createdEntry._id}`);
    res
      .status(201)
      .json({ message: "Entry saved successfully", entry: createdEntry });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Server error while saving entry" });
  }
};


const getAllEntries = async (req, res) => {
  const functionName = "getAllEntries";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching all entries`);
  try {
    const data = await Entry.find({ user: req.userId }).sort({ createdAt: -1 });
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Successfully fetched ${data.length} entries.`);
    return res.status(200).json({ entries: data });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getEntryById = async (req, res) => {
  const functionName = "getEntryById";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching entry id=${req.params.id}`);
  const { id } = req.params;

  try {
    const entry = await Entry.findById(id);

    if (!entry) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Entry not found id=${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Entry found id=${id}`);
    return res.status(200).json(entry);

  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    return res.status(500).json({ message: "Server error" });
  }
};


const editEntry = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`[LOG] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}] Received request to edit entry with ID: ${id}`);

    if (!id || id === "undefined" || id === "null") {
    console.log(`[LOG] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}] Invalid ID provided: ${id}`);
    return res
      .status(400)
      .json({ message: "A valid Entry ID must be provided." });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    console.log(`[LOG] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}] No update data provided for ID: ${id}`);
    return res.status(400).json({ message: "Update data cannot be empty." });
  }

  try {
    const updatedEntry = await Entry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEntry) {
      console.log(`[LOG] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}] Entry not found id=${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }

    console.log(`[LOG] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}] Successfully updated entry id=${id}`);
    res
      .status(200)
      .json({ message: "Entry updated successfully", entry: updatedEntry });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [editEntry] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid ID format.", details: error.message });
    }
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", details: error.message });
    }
    res.status(500).json({ message: "Server error while editing entry" });
  }
};

const deleteEntry = async (req, res) => {
  const { id } = req.params;
  console.log(`[LOG] [${FILE}] [deleteEntry] [${req.userId || req.user?._id || "unknown"}] Received request to delete entry with ID: ${id}`);

  if (!id || id === "undefined" || id === "null") {
    console.warn(`Delete failed: Invalid ID provided: ${id}`);
    return res
      .status(400)
      .json({ message: "A valid Entry ID must be provided." });
  }

  try {
    // This function is fine, it just deletes by ID.
    const deletedEntry = await Entry.findByIdAndDelete(id);

    if (!deletedEntry) {
      console.log(`[LOG] [${FILE}] [deleteEntry] [${req.userId || req.user?._id || "unknown"}] Entry not found id=${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }

    console.log(`[ACTION] [${req.userId || req.user?._id || "unknown"}] deleted entry ${id}`);
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [deleteEntry] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while deleting entry" });
  }
};

module.exports = { saveEntry, getAllEntries, editEntry, deleteEntry, getEntryById };