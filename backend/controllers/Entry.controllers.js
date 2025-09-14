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
      !timeWastedMinutes ||
      !sleepHours ||
      !diaryEntry
    ) {
      console.warn("Save failed: Required fields missing.");
      return res.status(401).json({
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

const editEntry = async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to edit entry with ID: ${id}`);
  try {
    const updateData = req.body;
    if (!id || Object.keys(updateData).length === 0) {
      console.warn(`Edit failed: Invalid request for ID: ${id}`);
      return res
        .status(400)
        .json({ message: "Entry ID and update data are required" });
    }

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
    res.status(500).json({ message: "Server error while editing entry" });
  }
};

const deleteEntry = async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete entry with ID: ${id}`);
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
    res.status(500).json({ message: "Server error while deleting entry" });
  }
};

module.exports = { saveEntry, getAllEntries, editEntry, deleteEntry };
