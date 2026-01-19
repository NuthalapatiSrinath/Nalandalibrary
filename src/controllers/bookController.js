const Book = require("../models/Book");

// @desc    Get all books with Filtering & Pagination
// @route   GET /api/books
// @access  Public (or Protected)
exports.getBooks = async (req, res) => {
  try {
    const { genre, author, page = 1, limit = 10 } = req.query;
    const query = {};

    if (genre) query.genre = genre;
    if (author) query.author = { $regex: author, $options: "i" }; // Partial match

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Book.countDocuments(query);

    res.status(200).json({
      books,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Add a new book
// @route   POST /api/books
// @access  Admin
exports.createBook = async (req, res) => {
  try {
    const { title, author, ISBN, publicationDate, genre, copies } = req.body;

    // Check if ISBN exists
    const bookExists = await Book.findOne({ ISBN });
    if (bookExists)
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });

    const book = await Book.create({
      title,
      author,
      ISBN,
      publicationDate,
      genre,
      copies,
      availableCopies: copies, // Initially, available = total
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Admin
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
