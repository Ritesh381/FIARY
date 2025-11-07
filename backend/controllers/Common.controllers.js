const Entry = require("../models/Entry.models");
const Finance = require("../models/Finance.models");
const Todo = require("../models/Todo.models");
const Habit = require("../models/Habit.models");
const HabitEntry = require("../models/Habit.models").HabitEntry;
const mongoose = require("mongoose");

// Fetch all common data for a specific date
const getAll = async (req, res) => {
  try {
    const queryDate = new Date(req.query.date);

    if (isNaN(queryDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid or missing date query parameter." });
    }

    const [year, month, day] = req.query.date.split("-").map(Number);
const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));


    console.log({ startOfDay, endOfDay });

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

    res.status(200).json({ entry, finance, todos, habits });
  } catch (error) {
    console.error("Error fetching common data:", error);
    res.status(500).json({ message: "Server error fetching data" });
  }
};

const saveAll = async (req, res) => {
  try {
    const { entry, habits, todos, finance } = req.body;
    const userId = req.userId;

    // --- Create or Update Habit Entries ---
    if (habits && habits.length > 0) {
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

    // --- Create Finance Entries ---
    if (finance && finance.length > 0) {
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
    }

    res
      .status(200)
      .json({ message: "All data saved successfully.", success: true });
  } catch (error) {
    console.error("Error saving all data:", error);
    res.status(500).json({
      message: "Server error while saving all data",
      details: error.message,
      success: false,
    });
  }
};

const updateAll = async (req, res) => {
  try {
    const { entryData, financeData, todosData, habitsData, date } = req.body;
    const userId = req.user._id;

    let updatedEntry = null;

    // --- 1. Update Entry fields ---
    if (entryData && Object.keys(entryData).length > 0) {
      // Find entry for the date
      const [year, month, day] = date.split("-").map(Number);
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      const entry = await Entry.findOne({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
      if (entry) {
        Object.assign(entry, entryData);
        updatedEntry = await entry.save();
      }
    }

    // --- 2. Update Habits ---
    if (Array.isArray(habitsData) && habitsData.length > 0) {
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

    res.status(200).json({ message: "All changes updated successfully.", entry: updatedEntry });
  } catch (error) {
    console.error("Error updating common data:", error);
    res.status(500).json({ message: "Server error updating data" });
  }
};

module.exports = {
  getAll,
  saveAll,
  updateAll,
};
