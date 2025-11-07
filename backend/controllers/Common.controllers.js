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
    const { entryData, financeData, todosData, habitsData } = req.body;
    const userId = req.user._id;

    // Call already defined functions
    await Promise.all([
      updateEntry(entryData, userId),
      updateFinance(financeData, userId),
      updateTodos(todosData, userId),
      updateHabits(habitsData, userId),
    ]);

    res.status(200).json({ message: "All data updated successfully." });
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
