const { Habit, HabitEntry } = require("../models/Habit.models.js");

const createHabit = async (req, res) => {
  try {
    const { title, description, icon, habitType } = req.body;
    // Corrected how userId is retrieved from the request
    const userId = req.userId;

    // Updated validation to include habitType
    if (!title || !icon || !habitType) {
      return res
        .status(400)
        .json({ message: "title, icon, and habitType are required fields" });
    }

    // Check if habitType is a valid value
    if (!['develop', 'quit'].includes(habitType)) {
        return res.status(400).json({ message: "habitType must be either 'develop' or 'quit'" });
    }

    const createdHabit = await Habit.create({
      userId,
      title,
      description,
      icon,
      habitType,
    });
    console.log(`Successfully saved new habit with ID : ${createdHabit._id}`);
    res.status(201).json(createdHabit);
  } catch (error)
{
    console.error("Error saving habit:", error);
    res.status(500).json({ message: "Server error while saving the habit" });
  }
};

const editHabit = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = req.body;
    if (!id) {
      return res.status(400).json({ message: "Provide a valid ID of habit" });
    }
    if (!updated || Object.keys(updated).length === 0) {
      return res.status(400).json({ message: "Update data cannot be empty." });
    }
    // Security: Ensure a user can only edit their own habit
    const updatedEntry = await Habit.findOneAndUpdate(
        { _id: id, userId: req.userId }, 
        updated, 
        { new: true, runValidators: true }
    );
    if (!updatedEntry) {
      console.warn(`Edit failed: Habit not found with ID: ${id} for user ${req.userId}`);
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log(`Successfully updated habit with ID: ${id}`);
    res.status(200).json({ message: "Habit updated successfully", entry: updatedEntry });
  } catch (error) {
    console.error(`Error editing habit with ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Server error while editing entry" });
  }
};

const deleteHabit = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Provide a valid ID of habit" });
  }
  try {
    // Security: Ensure a user can only delete their own habit
    const archivedHabit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isDeleted: true },
      { new: true }
    );

    if (!archivedHabit) {
      console.warn(`Archive failed: Habit not found with ID: ${id} for user ${req.userId}`);
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log(`Successfully archived habit with ID: ${id}`);
    res.status(200).json({ message: "Habit archived successfully" });
  } catch (error) {
    console.error(`Error archiving entry with ID: ${id}`, error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while archiving entry" });
  }
};

const getAllHabits = async (req, res) => {
  try {
    const data = await Habit.find({ userId: req.userId, isDeleted: false });
    res.status(200).json({ habits: data });
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Habit entry controllers ---

const getEntriesOfOneHabit = async (req, res) => {
  try {
    const { habitId, startDate, endDate } = req.body;
    const userId = req.userId;

    if (!habitId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields: habitId, startDate, or endDate." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const entries = await HabitEntry.find({
      habitId: habitId,
      userId: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: "asc" });

    res.status(200).json(entries);
  } catch (error) {
    console.error(`Error fetching entries for habit:`, error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format provided." });
    }
    res.status(500).json({ message: "Server error while fetching habit entries." });
  }
};

const createEntries = async (req, res) => {
  const arr = req.body;
  const userId = req.userId;

  if (!Array.isArray(arr) || arr.length === 0) {
    return res.status(400).json({ message: "Request body must be a non-empty array of entries." });
  }

  try {
    const entriesToCreate = arr.map((entry) => ({ ...entry, userId }));
    await HabitEntry.insertMany(entriesToCreate, { ordered: false });
    res.status(201).json({ message: "All habit entries saved successfully" });
  } catch (error) {
    console.error("Error creating bulk entries:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid entry data.", details: error.message });
    }
    res.status(500).json({ message: "Server error while saving entries." });
  }
};

const updateEntries = async (req, res) => {
  const arr = req.body;
  const userId = req.userId;

  if (!Array.isArray(arr) || arr.length === 0) {
    return res.status(400).json({ message: "Request body must be a non-empty array of entries." });
  }

  try {
    const operations = arr.map((entry) => {
      if (!entry._id) {
        throw new Error("Invalid payload: All entries in the array must have an _id field.");
      }
      const { _id, ...fieldsToUpdate } = entry;
      return {
        updateOne: {
          filter: { _id, userId },
          update: { $set: fieldsToUpdate },
        },
      };
    });

    const result = await HabitEntry.bulkWrite(operations);
    res.status(200).json({ message: "Entries updated successfully", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error bulk updating entries:", error);
    if (error.message.includes("Invalid payload")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid _id format in one or more entries." });
    }
    res.status(500).json({ message: "Server error while updating entries." });
  }
};

module.exports = { createHabit, editHabit, deleteHabit, getAllHabits, getEntriesOfOneHabit, createEntries, updateEntries };
