const RepeatingTask = require("../models/RepeatingTaskSchema.models");
const Todo = require("../models/Todo.models");

// ✅ Create a new repeating task + initial todo
const createRepeatingTask = async (req, res) => {
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

    if (!title || !taskFrequencyToCreate || !repeatSchedule)
      return res.status(400).json({ message: "Missing required fields" });

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

    res.status(201).json({ repeatingTask, firstTodo: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create repeating task" });
  }
};

// ✅ Get all repeating tasks for user
const getRepeatingTasks = async (req, res) => {
  try {
    const tasks = await RepeatingTask.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch repeating tasks" });
  }
};

// ✅ Get one repeating task
const getRepeatingTaskById = async (req, res) => {
  try {
    const task = await RepeatingTask.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) return res.status(404).json({ message: "Repeating task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch repeating task" });
  }
};

// ✅ Update repeating task (pause, edit title, schedule, etc.)
const updateRepeatingTask = async (req, res) => {
  try {
    const updates = req.body;

    const task = await RepeatingTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Repeating task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update repeating task" });
  }
};

// ✅ Delete (or deactivate) repeating task
const deleteRepeatingTask = async (req, res) => {
  try {
    const task = await RepeatingTask.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) return res.status(404).json({ message: "Repeating task not found" });
    res.json({ message: "Repeating task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete repeating task" });
  }
};

// ✅ Pause or resume a repeating task
const toggleRepeatingTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await RepeatingTask.findOne({ _id: id, userId: req.userId });

    if (!task) return res.status(404).json({ message: "Repeating task not found" });

    task.isActive = !task.isActive;
    await task.save();

    res.json({
      message: `Repeating task ${task.isActive ? "resumed" : "paused"} successfully`,
      task,
    });
  } catch (err) {
    console.error(err);
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
