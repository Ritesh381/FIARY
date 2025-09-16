const Entry = require("../models/Entry.models.js");

const saveEntry = async (req, res) => {
  console.log("Received request to save new entry...");
  try {
    const {
      date,
      feeling,
      bestMoment = "",
      worstMoment = "",
      achievement = "",
      timeWastedMinutes,
      timeWastedNotes = "",
      sleepHours,
      sleepNotes = "",
      physicalActivity = "",
      didMasturbate = false,
      masturbationNotes = "",
      didTakeBath = false,
      diaryEntry,
    } = req.body;

    if (
      !date ||
      !feeling ||
      timeWastedMinutes === undefined || // Check for undefined specifically
      sleepHours === undefined || // Check for undefined specifically
      !diaryEntry
    ) {
      console.warn("Save failed: Required fields missing.");
      return res.status(400).json({ // Use 400 for bad request
        message:
          "date, feeling, timeWastedMinutes, sleepHours, diaryEntry are required",
      });
    }

    const newEntry = {
      feeling,
      bestMoment,
      worstMoment,
      achievement,
      timeWastedMinutes,
      timeWastedNotes,
      sleepHours,
      sleepNotes,
      physicalActivity,
      didMasturbate,
      masturbationNotes,
      didTakeBath,
      diaryEntry,
      date,
    };
    const createdEntry = await Entry.create(newEntry);
    console.log(`Successfully saved new entry with ID: ${createdEntry._id}`);
    res
      .status(201)
      .json({ message: "Entry saved successfully", entry: createdEntry });
  } catch (error) {
    console.error("Error saving entry:", error);
    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Server error while saving entry" });
  }
};

const getAllEntries = async (req, res) => {
  console.log("Received request to fetch all entries.");
  try {
    const data = await Entry.find({}).sort({ createdAt: -1 });
    console.log(`Successfully fetched ${data.length} entries.`);
    return res.status(200).json({ entries: data });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- MODIFIED FUNCTION ---
const editEntry = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // **Step 1: Log incoming data for debugging**
  console.log(`Received request to edit entry with ID: ${id}`);

  // **Step 2: Add robust checks for invalid input**
  if (!id || id === 'undefined' || id === 'null') {
      console.warn(`Edit failed: Invalid ID provided: ${id}`);
      return res.status(400).json({ message: "A valid Entry ID must be provided." });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    console.warn(`Edit failed: No update data provided for ID: ${id}`);
    return res.status(400).json({ message: "Update data cannot be empty." });
  }

  try {
    // **Step 3: Find and update the document**
    const updatedEntry = await Entry.findByIdAndUpdate(id, updateData, {
      new: true, // Return the modified document
      runValidators: true, // IMPORTANT: This ensures the update follows your schema rules
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
    // **Step 4: Provide specific error messages**
    console.error(`Error editing entry with ID: ${id}`, error);

    // Specific check for CastError (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format.", details: error.message });
    }
    // Specific check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation failed.", details: error.message });
    }

    // Generic server error for everything else
    res.status(500).json({ message: "Server error while editing entry" });
  }
};


const deleteEntry = async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete entry with ID: ${id}`);

  // Add check for invalid ID
  if (!id || id === 'undefined' || id === 'null') {
      console.warn(`Delete failed: Invalid ID provided: ${id}`);
      return res.status(400).json({ message: "A valid Entry ID must be provided." });
  }

  try {
    const deletedEntry = await Entry.findByIdAndDelete(id);

    if (!deletedEntry) {
      console.warn(`Delete failed: Entry not found with ID: ${id}`);
      return res.status(404).json({ message: "Entry not found" });
    }

    console.log(`Successfully deleted entry with ID: ${id}`);
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error(`Error deleting entry with ID: ${id}`, error);
     if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while deleting entry" });
  }
};

module.exports = { saveEntry, getAllEntries, editEntry, deleteEntry };