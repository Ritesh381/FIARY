const { Habit, HabitEntry } = require("../models/Habit.models.js");
const mongoose = require("mongoose");

const FILE = "Habits.controllers.js";

const createHabit = async (req, res) => {
  const functionName = "createHabit";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Creating habit with payload: ${JSON.stringify({ title: req.body.title, habitType: req.body.habitType })}`);
  try {
    const { title, description, icon, habitType } = req.body;
    const userId = req.userId;

    if (!title || !icon || !habitType) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Validation failed: missing fields`);
      return res
        .status(400)
        .json({ message: "title, icon, and habitType are required fields" });
    }

    if (!['develop', 'quit'].includes(habitType)) {
        console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Validation failed: invalid habitType ${habitType}`);
        return res.status(400).json({ message: "habitType must be either 'develop' or 'quit'" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Inserting habit into DB`);
    const createdHabit = await Habit.create({
      userId,
      title,
      description,
      icon,
      habitType,
    });
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Successfully saved new habit with ID: ${createdHabit._id}`);
    res.status(201).json(createdHabit);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error while saving the habit" });
  }
};

const editHabit = async (req, res) => {
  const functionName = "editHabit";
  const id = req.params.id;
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Editing habit id=${id}`);
  try {
    const updated = req.body;
    if (!id) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Invalid id`);
      return res.status(400).json({ message: "Provide a valid ID of habit" });
    }
    if (!updated || Object.keys(updated).length === 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Empty update data`);
      return res.status(400).json({ message: "Update data cannot be empty." });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Updating DB`);
    const updatedEntry = await Habit.findOneAndUpdate(
        { _id: id, userId: req.userId }, 
        updated, 
        { new: true, runValidators: true }
    );
    if (!updatedEntry) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Habit not found id=${id}`);
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Successfully updated habit id=${id}`);
    res.status(200).json({ message: "Habit updated successfully", entry: updatedEntry });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error while editing entry" });
  }
};

const deleteHabit = async (req, res) => {
  const functionName = "deleteHabit";
  const id = req.params.id;
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Archiving habit id=${id}`);
  if (!id) {
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Invalid id`);
    return res.status(400).json({ message: "Provide a valid ID of habit" });
  }
  try {
    const archivedHabit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isDeleted: true },
      { new: true }
    );

    if (!archivedHabit) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Habit not found id=${id}`);
      return res.status(404).json({ message: "Habit not found" });
    }

    console.log(`[ACTION] [${req.userId || req.user?._id || "unknown"}] archived habit ${id}`);
    res.status(200).json({ message: "Habit archived successfully" });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while archiving entry" });
  }
};

const getAllHabits = async (req, res) => {
  const functionName = "getAllHabits";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching all habits`);
  try {
    const data = await Habit.find({ userId: req.userId, isDeleted: false });
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Retrieved ${data.length} habits`);
    res.status(200).json({ habits: data });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Habit entry controllers ---
const getEntriesOfOneHabit = async (req, res) => {
  const functionName = "getEntriesOfOneHabit";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching entries for one habit`);
  try {
    // Read from req.params, not req.body
    const { habitId } = req.params; 
    const { startDate, endDate } = req.body;
    const userId = req.userId;

    if (!habitId || !startDate || !endDate) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing required fields`);
      return res.status(400).json({ message: "Missing required fields: habitId (in URL), startDate, or endDate." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set to start and end of day for accurate range
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying HabitEntry for habitId=${habitId} from ${start.toISOString()} to ${end.toISOString()}`);
    const entries = await HabitEntry.find({
      habitId: habitId,
      userId: userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: "asc" });

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Found ${entries.length} entries`);
    res.status(200).json(entries);
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format provided." });
    }
    res.status(500).json({ message: "Server error while fetching habit entries." });
  }
};

const upsertHabitEntry = async (req, res) => {
  const functionName = "upsertHabitEntry";
  const { habitId, date, done, notes } = req.body;
  const userId = req.userId;

  console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Upserting habit entry for habitId=${habitId} date=${date}`);

  if (!habitId || !date || done === undefined) {
    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Validation failed`);
    return res.status(400).json({ message: "habitId, date, and done are required." });
  }

  try {
    // Normalize date to the start of the day
    const entryDate = new Date(date);
    entryDate.setUTCHours(0, 0, 0, 0);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Writing HabitEntry to DB`);
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

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Upsert successful id=${updatedEntry._id}`);
    res.status(200).json({ message: "Habit entry saved", entry: updatedEntry });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${userId || "unknown"}]`, error && error.stack ? error.stack : error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format.", details: error.message });
    }
    res.status(500).json({ message: "Server error while saving habit entry." });
  }
};

const getHabitEntriesForOneDay = async (req,res) => {
  const functionName = "getHabitEntriesForOneDay";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}] Fetching habit entries for one day`);
  try {
    const { userId } = req;
    const { date } = req.query; // e.g., "2025-10-10" or a full timestamp

    if (!date) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Missing date`);
      return res.status(400).json({ message: "A 'date' query parameter is required. (e.g., ?date=YYYY-MM-DD)" });
    }

    const localDay = new Date(date); 
    const startDate = new Date(localDay);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(localDay);
    endDate.setHours(23, 59, 59, 999);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Querying HabitEntry from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    const habits = await HabitEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Found ${habits.length} habit entries for date ${date}`);
    return res.status(200).json(habits); // Return the array of habits

  } catch (error) {
    console.error(`[ERROR] [${FILE}] [${functionName}] [${req.userId || req.user?._id || "unknown"}]`, error && error.stack ? error.stack : error);
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
