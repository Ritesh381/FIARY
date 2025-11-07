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
  batchsave,
  getTodosByDate,
} = require("../controllers/todo.controller");

router.post("/", auth, createTodo);
router.get("/", auth, getTodos);
router.get("/id/:id", auth, getTodoById);
router.put("/:id", auth, updateTodo);
router.delete("/:id", auth, deleteTodo);
router.patch("/:id/complete", auth, markTodoCompleted);
router.post("/batch-save", auth, batchsave)
router.get("/pending", auth, getTodosByDate);


module.exports = router;
