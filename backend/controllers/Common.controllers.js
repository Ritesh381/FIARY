const Entry = require("../models/Entry.models");
const Finance = require("../models/Finance.models");
const Todo = require("../models/Todo.models");
const Habit = require("../models/Habit.models");
const HabitEntry = require("../models/Habit.models").HabitEntry;
const mongoose = require("mongoose");

const FILE = "Common.controllers.js";

// Fetch all common data for a specific date
const getAll = async (req, res) => {
  const functionName = "getAll";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Fetching common data for date=${req.query.date}`);
  try {
    const queryDate = new Date(req.query.date);

    if (isNaN(queryDate.getTime())) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Invalid date`);
      return res
        .status(400)
        .json({ message: "Invalid or missing date query parameter." });
    }

    const [year, month, day] = req.query.date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Querying Entry/Todo/Habit/Finance`);
    const entry = await Entry.findOne({
      user: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    const todos = await Todo.find({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    const habits = await HabitEntry.find({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean();

    const finance = await Finance.find({
      created_by: req.user._id,
      when: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).lean({ getters: true });

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Returning entry/finance/todos/habits counts: ${entry ? 1 : 0}/${finance.length}/${todos.length}/${habits.length}`);
    res.status(200).json({ entry, finance, todos, habits });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [getAll] [${req.user?._id || req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error fetching data" });
  }
};

const saveAll = async (req, res) => {
  const functionName = "saveAll";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Saving all data`);
  try {
    const { entry, habits, todos, finance } = req.body;
    const userId = req.userId;

    // --- Create or Update Habit Entries ---
    if (habits && habits.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Processing ${habits.length} habit entries`);
      for (const habit of habits) {
        if (!habit.habitId || !habit.date || habit.done === undefined) {
          throw new Error("Missing required habit entry fields.");
        }

        const entryDate = new Date(habit.date);
        entryDate.setUTCHours(0, 0, 0, 0);

        await HabitEntry.findOneAndUpdate(
          {
            habitId: new mongoose.Types.ObjectId(habit.habitId),
            userId: new mongoose.Types.ObjectId(userId),
            date: entryDate,
          },
          { $set: { done: habit.done, notes: habit.notes } },
          { new: true, upsert: true, runValidators: true }
        );
      }
    }

    // --- Create Todos (only additions) ---
    if (todos && todos.addition && todos.addition.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Creating ${todos.addition.length} todos`);
      for (const todo of todos.addition) {
        if (!todo.title) throw new Error("Todo title is required.");

        const newTodo = new Todo({
          userId,
          title: todo.title,
          description: todo.description || "",
          category: todo.category || null,
          date: todo.date || null,
          priority: todo.priority || "medium", // <-- include priority
          frequency: todo.frequency || "once",
        });

        await newTodo.save();
      }
    }

    // --- Mark Completed Todos ---
    if (todos && todos.completed && todos.completed.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Marking ${todos.completed.length} todos as completed`);
      for (const todo of todos.completed) {
        if (!todo._id) continue;
        await Todo.findOneAndUpdate(
          { _id: todo._id, userId: userId },
          { status: "completed" }
        );
      }
    }

    // --- Create Finance Entries ---
    if (finance && finance.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Creating ${finance.length} finance entries`);
      for (const fin of finance) {
        const financeDoc = new Finance({
          created_by: userId,
          type: fin.type,
          when: fin.when,
          category_id: fin.category_id,
          category_name: fin.category_name,
          sub_category_id: fin.sub_category_id,
          sub_category_name: fin.sub_category_name,
          amount: fin.amount,
          note: fin.note,
          upload_link: fin.upload_link || null,
        });

        await financeDoc.save();
      }
    }

    // --- Create Entry ---
    if (entry) {
      if (
        !entry.date ||
        !entry.feelingScore ||
        entry.timeWastedMinutes === undefined ||
        entry.sleepHours === undefined ||
        !entry.diaryEntry
      ) {
        throw new Error("Missing required entry fields.");
      }

      const newEntry = new Entry({
        user: userId,
        date: entry.date,
        feelingScore: entry.feelingScore,
        achievement: entry.achievement || "",
        timeWastedMinutes: entry.timeWastedMinutes,
        timeWastedNotes: entry.timeWastedNotes || "",
        sleepHours: entry.sleepHours,
        sleepNotes: entry.sleepNotes || "",
        diaryEntry: entry.diaryEntry,
      });

      await newEntry.save();
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Created entry id=${newEntry._id}`);
      
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] All saves complete`);
      res
        .status(200)
        .json({ message: "All data saved successfully.", success: true, entry: newEntry });
    } else {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] All saves complete`);
      res
        .status(200)
        .json({ message: "All data saved successfully.", success: true });
    }
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [saveAll] [${req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({
      message: "Server error while saving all data",
      details: error.message,
      success: false,
    });
  }
};

const updateAll = async (req, res) => {
  const functionName = "updateAll";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.user?._id || req.userId || "unknown"}] Updating common data`);
  try {
    const { entryData, financeData, todosData, habitsData, date } = req.body;
    const userId = req.user._id;

    let updatedEntry = null;

    // --- 1. Update Entry fields ---
if (entryData && Object.keys(entryData).length > 0) {
  console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Updating entry for date=${date}`);

  // Validate date format
  if (!date || typeof date !== "string" || !date.includes("-")) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }

  const [year, month, day] = date.split("-").map(Number);
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  // Try to find existing entry
  let entry = await Entry.findOne({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (entry) {
    Object.assign(entry, entryData);
    updatedEntry = await entry.save();
    console.log(`[LOG] Updated existing entry id=${updatedEntry._id}`);
  } else {
    // Create a new entry if not found
    updatedEntry = await Entry.create({
      user: userId,
      date: startOfDay,
      ...entryData,
    });
    console.log(`[LOG] Created new entry id=${updatedEntry._id}`);
  }
}


    // --- 2. Update Habits ---
    if (Array.isArray(habitsData) && habitsData.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Updating ${habitsData.length} habits`);
      for (const habit of habitsData) {
        if (!habit.habitId) continue;
        const entryDate = new Date(date);
        entryDate.setUTCHours(0, 0, 0, 0);
        await HabitEntry.findOneAndUpdate(
          {
            habitId: habit.habitId,
            userId: userId,
            date: entryDate,
          },
          { $set: { done: habit.done, notes: habit.notes } },
          { new: true, upsert: true, runValidators: true }
        );
      }
    }

    // --- 3. Update Todos ---
    if (todosData) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Processing todos changes`);
      // Completed: [{_id, action}]
      if (Array.isArray(todosData.completed)) {
        for (const change of todosData.completed) {
          if (change.action === "add") {
            await Todo.findOneAndUpdate(
              { _id: change._id, userId: userId },
              { status: "completed" }
            );
          } else if (change.action === "remove") {
            await Todo.findOneAndUpdate(
              { _id: change._id, userId: userId },
              { status: "pending" }
            );
          }
        }
      }
      // Addition: [{id, action, data}]
      if (Array.isArray(todosData.addition)) {
        for (const change of todosData.addition) {
          if (change.action === "add" && change.data) {
            const newTodo = new Todo({
              userId,
              ...change.data,
              status: "pending",
            });
            await newTodo.save();
          } else if (change.action === "update" && change.data) {
            await Todo.findOneAndUpdate(
              { _id: change.id, userId: userId },
              change.data,
              { new: true }
            );
          } else if (change.action === "delete") {
            await Todo.findOneAndUpdate(
              { _id: change.id, userId: userId },
              { isDeleted: true }
            );
          }
        }
      }
    }

    // --- 4. Update Finance ---
    if (Array.isArray(financeData)) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Processing ${financeData.length} finance changes`);
      for (const change of financeData) {
        if (change.action === "add" && change.data) {
          const financeDoc = new Finance({
            created_by: userId,
            ...change.data,
          });
          await financeDoc.save();
        } else if (change.action === "update" && change.data) {
          await Finance.findOneAndUpdate(
            { _id: change._id, created_by: userId },
            change.data,
            { new: true }
          );
        } else if (change.action === "delete") {
          await Finance.findOneAndDelete({
            _id: change._id,
            created_by: userId,
          });
        }
      }
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] UpdateAll completed`);
    res.status(200).json({ message: "All changes updated successfully.", status:"ok", entry:updatedEntry });
  } catch (error) {
    console.error(`[ERROR] [${FILE}] [updateAll] [${req.user?._id || req.userId || "unknown"}]`, error && error.stack ? error.stack : error);
    res.status(500).json({ message: "Server error updating data" ,status:"error"});
  }
};

module.exports = {
  getAll,
  saveAll,
  updateAll,
};
