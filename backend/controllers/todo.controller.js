const Todo = require("../models/Todo.models");
// const RepeatingTask = require("../models/RepeatingTaskSchema.models"); // Removed as it's no longer used

// ✅ Create a new todo
const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      date,
      priority, // <-- accept priority
    } = req.body;

    // Check for required fields based on the new schema
    if (!title)
      return res
        .status(400)
        .json({ message: "Title is required" });

    const todo = new Todo({
      userId: req.userId,
      title,
      description,
      category,
      date: date || null, // Save the optional date
      priority: priority.toLowerCase() || "medium", // <-- persist priority (default medium)
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
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId, isDeleted: false },
      allowedUpdates,
      { new: true, runValidators: true } // Added runValidators for schema validation
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

// ✅ Get todos by date (using the new 'date' field)
const getTodosByDate = async (req, res) => {
  try {
    const { date } = req.query; // Expecting date as YYYY-MM-DD from frontend

    if (!date) {
      return res
        .status(400)
        .json({ message: "Date query parameter is required." });
    }

    // Calculate start and end of the target day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Start of the day

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // End of the day

    // Find todos that belong to the user, are active, and fall within the date range
    const todos = await Todo.find({
      userId: req.userId,
      isDeleted: false,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({
      date: 1, // Sort by date ascending (if time is included)
      createdAt: -1, // Secondary sort by newest creation
    });

    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos by date:", err);
    res.status(500).json({ message: "Failed to fetch todos for the day." });
  }
};

// ✅ Batch update for completed tasks and creation of new todos
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

    // --- 2. Create new Todos (Additions) ---
    if (additions && additions.length > 0) {
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