const Todo = require("../models/Todo.models");
// const RepeatingTask = require("../models/RepeatingTaskSchema.models"); // Removed as it's no longer used

const FILE = "todo.controller.js";

// ✅ Create a new todo
const createTodo = async (req, res) => {
  const functionName = "createTodo";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting create todo`);
  try {
    const {
      title,
      description,
      category,
      date,
      priority, // <-- accept priority
    } = req.body;

    // Check for required fields based on the new schema
    if (!title) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Missing title`);
      return res
        .status(400)
        .json({ message: "Title is required" });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Creating todo title=${title}`);
    const todo = new Todo({
      userId: req.userId,
      title,
      description,
      category,
      date: date || null, // Save the optional date
      priority: priority.toLowerCase() || "medium", // <-- persist priority (default medium)
    });

    await todo.save();
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Created todo id=${todo._id}`);
    res.status(201).json(todo);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [createTodo] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to create todo" });
  }
};

// ✅ Get all active todos for user
const getTodos = async (req, res) => {
  const functionName = "getTodos";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching todos`);
  try {
    const todos = await Todo.find({
      userId: req.userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${todos.length} todos`);
    res.json(todos);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getTodos] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};

// ✅ Get single todo by ID
const getTodoById = async (req, res) => {
  const functionName = "getTodoById";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching todo id=${req.params.id}`);
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });

    if (!todo) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Todo not found id=${req.params.id}`);
      return res.status(404).json({ message: "Todo not found" });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Returning todo id=${todo._id}`);
    res.json(todo);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getTodoById] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch todo" });
  }
};

// ✅ Update todo (title, description, status, photo, etc.)
const updateTodo = async (req, res) => {
  const functionName = "updateTodo";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updating todo id=${req.params.id}`);
  try {
    const { id } = req.params;
    // We only pass fields present in the new schema
    const allowedUpdates = {};
    const { title, description, status, category, date, priority } = req.body;

    if (title !== undefined) allowedUpdates.title = title;
    if (description !== undefined) allowedUpdates.description = description;
    if (status !== undefined) allowedUpdates.status = status;
    if (category !== undefined) allowedUpdates.category = category;
    // Only update date if explicitly provided
    if (date !== undefined) allowedUpdates.date = date;
    // Priority
    if (priority !== undefined) allowedUpdates.priority = priority;
    priority.toLowerCase();

    // Prevents accidentally setting empty updates if only removed fields were passed
    if (Object.keys(allowedUpdates).length === 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] No valid fields to update`);
      return res.status(400).json({ message: "No valid fields to update." });
    }

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Allowed updates: ${Object.keys(allowedUpdates).join(",")}`);
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId, isDeleted: false },
      allowedUpdates,
      { new: true, runValidators: true } // Added runValidators for schema validation
    );

    if (!todo) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Todo not found id=${id}`);
      return res.status(404).json({ message: "Todo not found" });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Updated todo id=${todo._id}`);
    res.json(todo);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [updateTodo] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to update todo" });
  }
};

// ✅ Soft delete todo
const deleteTodo = async (req, res) => {
  const functionName = "deleteTodo";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Deleting todo id=${req.params.id}`);
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isDeleted: true },
      { new: true }
    );

    if (!todo) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Todo not found id=${id}`);
      return res.status(404).json({ message: "Todo not found" });
    }
    console.log(`[ACTION] [${req.userId || "unknown"}] deleted todo ${id}`);
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [deleteTodo] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
};

// ✅ Mark todo as completed
const markTodoCompleted = async (req, res) => {
  const functionName = "markTodoCompleted";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Marking todo completed id=${req.params.id}`);
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId, isDeleted: false },
      { status: "completed" },
      { new: true }
    );

    if (!todo) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Todo not found id=${id}`);
      return res.status(404).json({ message: "Todo not found" });
    }
    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Todo marked completed id=${todo._id}`);
    res.json(todo);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [markTodoCompleted] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to update todo status" });
  }
};

// ✅ Get todos by date (using the new 'date' field)
const getTodosByDate = async (req, res) => {
  const functionName = "getTodosByDate";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Fetching todos by date`);
  try {
    const todos = await Todo.find({
      userId: req.userId,
      isDeleted: false,
      status: "pending",
    }).sort({
      date: 1,
      createdAt: -1,
    });

    console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Retrieved ${todos.length} todos`);
    res.json(todos);
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [getTodosByDate] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to fetch todos for the previous day." });
  }
};

// ✅ Batch update for completed tasks and creation of new todos
const batchsave = async (req, res) => {
  const functionName = "batchsave";
  console.log(`[LOG] [${FILE}] [${functionName}] [${req.userId || "unknown"}] Starting batch save`);
  try {
    const { completed, additions } = req.body;
    const userId = req.userId;
    const batchPromises = [];

    // --- 1. Mark existing Todos as Completed ---
    if (completed && completed.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Marking ${completed.length} todos as completed`);
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

    // --- 2. Create new Todos (Additions) ---
    if (additions && additions.length > 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Creating ${additions.length} new todos`);
      // Map additions to full Mongoose documents, ensuring userId is set
      const newTodos = additions.map((task) => ({
        userId: userId,
        title: task.title,
        description: task.description,
        category: task.category,
        date: task.date || null, // Include the optional date
        priority: task.priority || "medium", // <-- include priority for new todos
      }));

      const createNewPromise = Todo.insertMany(newTodos);
      batchPromises.push(createNewPromise);
    }

    if (batchPromises.length === 0) {
      console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] No changes submitted`);
      return res.status(200).json({ message: "No Todo changes submitted." });
    }

    // Execute both operations concurrently
    const [completedResult, createdResult] = await Promise.all(batchPromises);

    console.log(`[LOG] [${FILE}] [${functionName}] [${userId || "unknown"}] Batch save completed`);
    res.status(200).json({
      message: "Todos batch saved successfully.",
      completedCount: completedResult ? completedResult.modifiedCount : 0,
      createdCount: createdResult ? createdResult.length : 0,
    });
  } catch (err) {
    console.error(`[ERROR] [${FILE}] [batchsave] [${req.userId || "unknown"}]`, err && err.stack ? err.stack : err);
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