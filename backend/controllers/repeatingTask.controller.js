const RepeatingTask = require("../models/RepeatingTaskSchema.models");
const Todo = require("../models/Todo.models");

const FILE = "repeatingTask.controller.js";

// ✅ Create a new repeating task + initial todo
const createRepeatingTask = async (req, res) => {
  const functionName = "createRepeatingTask";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting create repeating task`);
  try {
    const {
      title,
      description,
      photoUrl,
      category,
      taskFrequencyToCreate,
      repeatSchedule,
      startDate,
      endDate,
    } = req.body;

    if (!title || !taskFrequencyToCreate || !repeatSchedule) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing required fields`);
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Creating RepeatingTask title=${title}`);
    const repeatingTask = new RepeatingTask({
      userId: req.userId,
      title,
      description,
      photoUrl,
      category,
      taskFrequencyToCreate,
      repeatSchedule,
      startDate,
      endDate,
    });

    await repeatingTask.save();

    // 🔁 Automatically create first Todo
    const todo = new Todo({
      userId: req.userId,
      title,
      description,
      photoUrl,
      frequency: taskFrequencyToCreate,
      category,
      repeatingTaskId: repeatingTask._id,
    });

    await todo.save();

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created repeatingTask id=${repeatingTask._id} and todo id=${todo._id}`);
    res.status(201).json({ repeatingTask, firstTodo: todo });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [createRepeatingTask] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to create repeating task" });
  }
};

// ✅ Get all repeating tasks for user
const getRepeatingTasks = async (req, res) => {
  const functionName = "getRepeatingTasks";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching repeating tasks`);
  try {
    const tasks = await RepeatingTask.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${tasks.length} tasks`);
    res.json(tasks);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getRepeatingTasks] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch repeating tasks" });
  }
};

// ✅ Get one repeating task
const getRepeatingTaskById = async (req, res) => {
  const functionName = "getRepeatingTaskById";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching repeating task id=${req.params.id}`);
  try {
    const task = await RepeatingTask.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Not found id=${req.params.id}`);
      return res.status(404).json({ message: "Repeating task not found" });
    }
    res.json(task);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getRepeatingTaskById] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch repeating task" });
  }
};

// ✅ Update repeating task (pause, edit title, schedule, etc.)
const updateRepeatingTask = async (req, res) => {
  const functionName = "updateRepeatingTask";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating repeating task id=${req.params.id}`);
  try {
    const updates = req.body;

    const task = await RepeatingTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!task) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Not found id=${req.params.id}`);
      return res.status(404).json({ message: "Repeating task not found" });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated id=${task._id}`);
    res.json(task);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [updateRepeatingTask] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to update repeating task" });
  }
};

// ✅ Delete (or deactivate) repeating task
const deleteRepeatingTask = async (req, res) => {
  const functionName = "deleteRepeatingTask";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting repeating task id=${req.params.id}`);
  try {
    const task = await RepeatingTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Not found id=${req.params.id}`);
      return res.status(404).json({ message: "Repeating task not found" });
    }
    console.log(`[ACTION] [${req.userId || "unknown"}] deleted repeating task ${req.params.id}`);
    res.json({ message: "Repeating task deleted successfully" });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [deleteRepeatingTask] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to delete repeating task" });
  }
};

// ✅ Pause or resume a repeating task
const toggleRepeatingTask = async (req, res) => {
  const functionName = "toggleRepeatingTask";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Toggling task id=${req.params.id}`);
  try {
    const { id } = req.params;
    const task = await RepeatingTask.findOne({ _id: id, userId: req.userId });

    if (!task) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Not found id=${id}`);
      return res.status(404).json({ message: "Repeating task not found" });
    }

    task.isActive = !task.isActive;
    await task.save();

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Toggled isActive=${task.isActive} id=${task._id}`);
    res.json({
      message: `Repeating task ${task.isActive ? "resumed" : "paused"} successfully`,
      task,
    });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [toggleRepeatingTask] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to toggle repeating task" });
  }
};

module.exports = {
  createRepeatingTask,
  getRepeatingTasks,
  getRepeatingTaskById,
  updateRepeatingTask,
  deleteRepeatingTask,
  toggleRepeatingTask,
};
