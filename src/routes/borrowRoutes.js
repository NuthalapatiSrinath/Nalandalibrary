const express = require("express");
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getHistory,
} = require("../controllers/borrowController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect); // All routes below require login

router.post("/:bookId", borrowBook);
router.post("/return/:bookId", returnBook);
router.get("/history", getHistory);

module.exports = router;
