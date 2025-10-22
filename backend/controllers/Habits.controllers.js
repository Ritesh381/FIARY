const { Habit, HabitEntry } = require("../models/Habit.models.js");
const mongoose = require("mongoose");

const createHabit = async (req, res) => {
  try {
    const { title, description, icon, habitType } = req.body;
    const userId = req.userId;

    if (!title || !icon || !habitType) {
      return res
        .status(400)
        .json({ message: "title, icon, and habitType are required fields" });
    }

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
    // Read from req.params, not req.body
    const { habitId } = req.params; 
    const { startDate, endDate } = req.body;
    const userId = req.userId;

    if (!habitId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields: habitId (in URL), startDate, or endDate." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set to start and end of day for accurate range
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

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

const upsertHabitEntry = async (req, res) => {
    const { habitId, date, done, notes } = req.body;
    const userId = req.userId;

    if (!habitId || !date || done === undefined) {
        return res.status(400).json({ message: "habitId, date, and done are required." });
    }

    try {
        // Normalize date to the start of the day
        const entryDate = new Date(date);
        entryDate.setUTCHours(0, 0, 0, 0);

        // Find by habitId, userId, and date, and update (or create if not found)
        const updatedEntry = await HabitEntry.findOneAndUpdate(
            {
                habitId: new mongoose.Types.ObjectId(habitId),
                userId: new mongoose.Types.ObjectId(userId),
                date: entryDate,
            },
            {
                $set: {
                    done: done,
                    notes: notes,
                },
            },
            {
                new: true, // Return the modified (or new) document
                upsert: true, // Create a new document if one doesn't match
                runValidators: true,
            }
        );

        res.status(200).json({ message: "Habit entry saved", entry: updatedEntry });
    } catch (error) {
        console.error("Error saving habit entry:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format.", details: error.message });
        }
        res.status(500).json({ message: "Server error while saving habit entry." });
    }
};

const getHabitEntriesForOneDay = async (req,res) => {
  console.log("Received request to fetch habit entries for one day.");
  try {
    const { userId } = req;
    const { date } = req.query; // e.g., "2025-10-10" or a full timestamp

    if (!date) {
      return res.status(400).json({ message: "A 'date' query parameter is required. (e.g., ?date=YYYY-MM-DD)" });
    }

    const localDay = new Date(date); 
    const startDate = new Date(localDay);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(localDay);
    endDate.setHours(23, 59, 59, 999);

    const habits = await HabitEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    console.log(`Found ${habits.length} habit entries for date ${date}.`);
    return res.status(200).json(habits); // Return the array of habits

  } catch (error) {
    console.error("Error fetching habit entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


module.exports = { 
    createHabit, 
    editHabit, 
    deleteHabit, 
    getAllHabits, 
    getEntriesOfOneHabit, 
    upsertHabitEntry,
    getHabitEntriesForOneDay
};
