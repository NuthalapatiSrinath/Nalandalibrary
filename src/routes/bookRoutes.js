const express = require("express");
const router = express.Router();
const {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { getReports } = require("../controllers/reportController");
// Public Route
router.get("/", getBooks);

// Admin Only Routes
router.post("/", protect, authorize("Admin"), createBook);
router.put("/:id", protect, authorize("Admin"), updateBook);
router.delete("/:id", protect, authorize("Admin"), deleteBook);
router.get("/reports", protect, authorize("Admin"), getReports);
module.exports = router;
