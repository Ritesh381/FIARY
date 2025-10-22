const mongoose = require("mongoose")
const Entry = require("../models/Entry.models.js");
const {HabitEntry} = require("../models/Habit.models.js")

const saveEntry = async (req, res) => {
  console.log("Received request to save new entry...");
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
      console.warn("Save failed: Required fields missing.");
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

    const createdEntry = await Entry.create(newEntry);
    console.log(`Successfully saved new entry with ID: ${createdEntry._id}`);
    res
      .status(201)
      .json({ message: "Entry saved successfully", entry: createdEntry });
  } catch (error) {
    console.error("Error saving entry:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Server error while saving entry" });
  }
};


const getAllEntries = async (req, res) => {
  console.log("Received request to fetch all entries.");
  try {
    const data = await Entry.find({ user: req.userId }).sort({ createdAt: -1 });
    console.log(`Successfully fetched ${data.length} entries.`);
    return res.status(200).json({ entries: data });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getEntryById = async (req, res) => {
  console.log(`Received request to fetch entry data for ID: ${req.params.id}`);
  const { id } = req.params;

  

  try {
    const entry = await Entry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    return res.status(200).json(entry);

  } catch (error) {
    console.error("Error fetching entry data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const editEntry = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log(`Received request to edit entry with ID: ${id}`);

  if (!id || id === "undefined" || id === "null") {
    console.warn(`Edit failed: Invalid ID provided: ${id}`);
    return res
      .status(400)
      .json({ message: "A valid Entry ID must be provided." });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    console.warn(`Edit failed: No update data provided for ID: ${id}`);
    return res.status(400).json({ message: "Update data cannot be empty." });
  }

  try {
    const updatedEntry = await Entry.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEntry) {
      console.warn(`Edit failed: Entry not found with ID: ${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }

    console.log(`Successfully updated entry with ID: ${id}`);
    res
      .status(200)
      .json({ message: "Entry updated successfully", entry: updatedEntry });
  } catch (error) {
    console.error(`Error editing entry with ID: ${id}`, error);
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
  console.log(`Received request to delete entry with ID: ${id}`);

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
      console.warn(`Delete failed: Entry not found with ID: ${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }

    console.log(`Successfully deleted entry with ID: ${id}`);
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error(`Error deleting entry with ID: ${id}`, error);
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while deleting entry" });
  }
};

module.exports = { saveEntry, getAllEntries, editEntry, deleteEntry, getEntryById };