const express = require("express");
const router = express.Router();
const auth = require("../middleware/isAuth");
const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  markTodoCompleted,
} = require("../controllers/todo.controller");

router.post("/", auth, createTodo);
router.get("/", auth, getTodos);
router.get("/:id", auth, getTodoById);
router.put("/:id", auth, updateTodo);
router.delete("/:id", auth, deleteTodo);
router.patch("/:id/complete", auth, markTodoCompleted);

module.exports = router;
