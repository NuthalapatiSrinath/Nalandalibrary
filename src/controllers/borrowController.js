const BorrowingRecord = require("../models/BorrowingRecord");
const Book = require("../models/Book");

// @desc    Borrow a book
// @route   POST /api/borrow/:bookId
// @access  Member
exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // From Auth Middleware

    // 1. Check Book Availability
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies < 1)
      return res.status(400).json({ message: "Book not available" });

    // 2. Check if user already has it (Optional but good practice)
    const existingBorrow = await BorrowingRecord.findOne({
      user: userId,
      book: bookId,
      status: "Borrowed",
    });
    if (existingBorrow)
      return res
        .status(400)
        .json({ message: "You already borrowed this book" });

    // 3. Create Record
    const record = await BorrowingRecord.create({
      user: userId,
      book: bookId,
      status: "Borrowed",
    });

    // 4. Decrease Book Copy
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ message: "Book borrowed successfully", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Return a book
// @route   POST /api/return/:bookId
// @access  Member
exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;

    // 1. Find the active record
    const record = await BorrowingRecord.findOne({
      user: userId,
      book: bookId,
      status: "Borrowed",
    });

    if (!record)
      return res
        .status(400)
        .json({ message: "No active borrowing record found" });

    // 2. Update Record
    record.status = "Returned";
    record.returnDate = Date.now();
    await record.save();

    // 3. Increase Book Copy
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    res.status(200).json({ message: "Book returned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get my borrowing history
// @route   GET /api/borrow/history
// @access  Member
exports.getHistory = async (req, res) => {
  try {
    const history = await BorrowingRecord.find({ user: req.user.userId })
      .populate("book", "title author") // Only get title and author
      .sort({ borrowDate: -1 });

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
