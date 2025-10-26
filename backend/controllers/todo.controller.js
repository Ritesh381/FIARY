const Todo = require("../models/Todo.models");
const RepeatingTask = require("../models/RepeatingTaskSchema.models");

// ✅ Create a new todo
const createTodo = async (req, res) => {
  try {
    const { title, description, photoUrl, frequency, category, repeatingTaskId } = req.body;

    if (!title || !frequency)
      return res.status(400).json({ message: "Title and frequency are required" });

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
    const todos = await Todo.find({ userId: req.userId, isDeleted: false })
      .sort({ createdAt: -1 });

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

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  markTodoCompleted,
};
