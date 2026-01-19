// src/api/graphql/resolvers.js
const User = require("../../models/User");
const Book = require("../../models/Book");
const BorrowingRecord = require("../../models/BorrowingRecord");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper to check Auth
const checkAuth = (context) => {
  if (!context.isAuth) {
    throw new Error("Unauthenticated! Please log in.");
  }
};

const checkAdmin = (context) => {
  checkAuth(context);
  if (context.userRole !== "Admin") {
    throw new Error("Access Denied! Admins only.");
  }
};

module.exports = {
  // --- Queries ---
  books: async ({ page = 1, limit = 10, genre }) => {
    const query = genre ? { genre } : {};
    return await Book.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
  },

  myHistory: async (args, context) => {
    checkAuth(context);
    const records = await BorrowingRecord.find({ member: context.userId })
      .populate("book")
      .populate("member");

    // Transform dates for GraphQL
    return records.map((record) => ({
      ...record._doc,
      borrowDate: new Date(record.borrowDate).toISOString(),
      returnDate: record.returnDate
        ? new Date(record.returnDate).toISOString()
        : null,
    }));
  },

  // --- Mutations ---
  register: async ({ userInput }) => {
    const user = await User.create(userInput);
    return user;
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return { userId: user.id, token, tokenExpiration: 1 };
  },

  createBook: async ({ bookInput }, context) => {
    checkAdmin(context);
    // Note: availableCopies starts equal to total copies
    const book = new Book({
      ...bookInput,
      availableCopies: bookInput.copies,
    });
    return await book.save();
  },

  borrowBook: async ({ bookId }, context) => {
    checkAuth(context);

    // 1. Check Book Availability
    const book = await Book.findById(bookId);
    if (!book) throw new Error("Book not found");
    if (book.availableCopies < 1) throw new Error("Book not available");

    // 2. Create Record
    const record = new BorrowingRecord({
      book: bookId,
      member: context.userId,
      status: "Borrowed",
    });

    // 3. Update Book Count & Save
    book.availableCopies -= 1;
    await book.save();
    await record.save();

    // 4. Return populated record
    const populatedRecord = await BorrowingRecord.findById(record._id)
      .populate("book")
      .populate("member");

    return {
      ...populatedRecord._doc,
      borrowDate: new Date(populatedRecord.borrowDate).toISOString(),
    };
  },
};
