const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {
  createMemory,
  getMemories,
  updateMemory,
  deleteMemory,
} = require("../controllers/Memories.controllers");
const auth = require("../middleware/isAuth");

// Upload multiple photos
router.post("/", auth, upload.array("photos", 10), createMemory);
router.get("/", auth, getMemories);
router.put("/:id", auth, upload.array("photos", 10), updateMemory);
router.delete("/:id", auth, deleteMemory);

module.exports = router;
