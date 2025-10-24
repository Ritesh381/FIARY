const express = require("express");
const router = express.Router();
const auth = require("../middleware/isAuth");
const {
  createRepeatingTask,
  getRepeatingTasks,
  getRepeatingTaskById,
  updateRepeatingTask,
  deleteRepeatingTask,
  toggleRepeatingTask,
} = require("../controllers/repeatingTask.controller");

router.post("/", auth, createRepeatingTask);
router.get("/", auth, getRepeatingTasks);
router.get("/:id", auth, getRepeatingTaskById);
router.put("/:id", auth, updateRepeatingTask);
router.delete("/:id", auth, deleteRepeatingTask);
router.patch("/:id/toggle", auth, toggleRepeatingTask);

module.exports = router;
