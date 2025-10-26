const Todo = require("../models/Todo.models");
const RepeatingTask = require("../models/RepeatingTaskSchema.models");

// ✅ Create a new todo
const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      photoUrl,
      frequency,
      category,
      repeatingTaskId,
    } = req.body;

    if (!title || !frequency)
      return res
        .status(400)
        .json({ message: "Title and frequency are required" });

    const todo = new Todo({
      userId: req.userId,
      title,
      description,
      photoUrl,
      frequency,
      category,
      repeatingTaskId: repeatingTaskId || null,
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ message: "Failed to create todo" });
  }
};

// ✅ Get all active todos for user
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};

// ✅ Get single todo by ID
const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch todo" });
  }
};

// ✅ Update todo (title, description, status, photo, etc.)
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId, isDeleted: false },
      updates,
      { new: true }
    );

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update todo" });
  }
};

// ✅ Soft delete todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isDeleted: true },
      { new: true }
    );

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
};

// ✅ Mark todo as completed
const markTodoCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId, isDeleted: false },
      { status: "completed" },
      { new: true }
    );

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update todo status" });
  }
};

const getTodosByDate = async (req, res) => {
  try {
    const { date } = req.query; // Expecting date as YYYY-MM-DD from frontend

    if (!date) {
      return res
        .status(400)
        .json({ message: "Date query parameter is required." });
    }

    const targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999);

    // Find todos that meet all conditions:
    // 1. Belong to the user
    // 2. Are not soft-deleted
    // 3. Are still 'pending'
    // 4. Have an expiresAt time greater than the start of the current day AND less than or equal to the end of the target day.
    //    (Since the `expiresAt` logic sets expiry to the end of the day, we check against the end of the target day.)

    const todos = await Todo.find({
      userId: req.userId,
      isDeleted: false,
      status: "pending",
      expiresAt: { $lte: targetDate },
    }).sort({
      expiresAt: 1, // Sort by soonest expiration first
      createdAt: -1, // Secondary sort by newest creation
    });

    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos by date:", err);
    res.status(500).json({ message: "Failed to fetch todos for the day." });
  }
};

const batchsave = async (req, res) => {
  try {
    const { completed, additions } = req.body;
    const userId = req.userId;
    const batchPromises = [];

    // --- 1. Mark existing Todos as Completed ---
    if (completed && completed.length > 0) {
      // Find all completed task IDs and update their status
      const updateCompletedPromise = Todo.updateMany(
        {
          _id: { $in: completed }, // Use IDs provided from the frontend
          userId: userId,
          status: "pending", // Only update if still pending
        },
        { $set: { status: "completed" } }
      );
      batchPromises.push(updateCompletedPromise);
    }

    // --- 2. Create new 'Tasks for Tomorrow' (Additions) ---
    if (additions && additions.length > 0) {
      // Map additions to full Mongoose documents, ensuring userId is set
      const newTodos = additions.map((task) => ({
        userId: userId,
        title: task.title,
        description: task.description,
        frequency: task.frequency || "daily", // Default to daily if missing
        category: task.category,
        // The Todo model's pre-save middleware will automatically set `expiresAt`
      }));

      const createNewPromise = Todo.insertMany(newTodos);
      batchPromises.push(createNewPromise);
    }

    if (batchPromises.length === 0) {
      return res.status(200).json({ message: "No Todo changes submitted." });
    }

    // Execute both operations concurrently
    const [completedResult, createdResult] = await Promise.all(batchPromises);

    res.status(200).json({
      message: "Todos batch saved successfully.",
      completedCount: completedResult ? completedResult.modifiedCount : 0,
      createdCount: createdResult ? createdResult.length : 0,
    });
  } catch (err) {
    console.error("Error during Todo batch save:", err);
    res.status(500).json({ message: "Failed to process todo batch save." });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  markTodoCompleted,
  batchsave,
  getTodosByDate,
};
