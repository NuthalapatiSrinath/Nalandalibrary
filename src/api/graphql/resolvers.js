const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config"); // Import centralized config
const { encrypt } = require("../../utils/encryption"); // Import encryption
const reportService = require("../../services/reportService");
// Import Models
const User = require("../../models/User");
const Book = require("../../models/Book");
const BorrowingRecord = require("../../models/BorrowingRecord");

// --- Helpers ---
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
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  },

  myHistory: async (args, context) => {
    checkAuth(context);
    const records = await BorrowingRecord.find({ user: context.userId }) // Note: Schema uses 'user' not 'member'
      .populate("book")
      .populate("user")
      .sort({ borrowDate: -1 });

    // Map to match GraphQL Type
    return records.map((record) => ({
      ...record._doc,
      id: record._id,
      member: record.user, // Map DB 'user' field to GraphQL 'member' field
      borrowDate: new Date(record.borrowDate).toISOString(),
      returnDate: record.returnDate
        ? new Date(record.returnDate).toISOString()
        : null,
    }));
  },

  mostBorrowedBooks: async (args, context) => {
    checkAdmin(context); // Security check
    return await reportService.getMostBorrowedBooks();
  },

  // --- Mutations ---
  register: async ({ userInput }) => {
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error("User already exists.");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userInput.password, salt);

    const user = new User({
      name: userInput.name,
      email: userInput.email,
      password: hashedPassword,
      role: "Member", // Default role
    });

    return await user.save();
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // --- ENCRYPTION STEP (Task Requirement) ---
    // 1. Create a JSON string of the data
    const payloadData = JSON.stringify({ userId: user.id, role: user.role });

    // 2. Encrypt that string using our utility
    const encryptedPayload = encrypt(payloadData);

    // 3. Sign the JWT with the ENCRYPTED string
    const token = jwt.sign({ data: encryptedPayload }, config.jwtSecret, {
      expiresIn: "1h",
    });

    return { userId: user.id, token, tokenExpiration: 1 };
  },

  // -- Admin Book Management --
  createBook: async ({ bookInput }, context) => {
    checkAdmin(context);
    const book = new Book({
      ...bookInput,
      availableCopies: bookInput.copies, // Initially available = total
    });
    return await book.save();
  },

  updateBook: async ({ id, bookInput }, context) => {
    checkAdmin(context);
    const book = await Book.findByIdAndUpdate(id, bookInput, { new: true });
    if (!book) throw new Error("Book not found");
    return book;
  },

  deleteBook: async ({ id }, context) => {
    checkAdmin(context);
    const book = await Book.findByIdAndDelete(id);
    return !!book; // Returns true if deleted
  },

  // -- Borrowing System --
  borrowBook: async ({ bookId }, context) => {
    checkAuth(context);

    // 1. Check Availability
    const book = await Book.findById(bookId);
    if (!book) throw new Error("Book not found");
    if (book.availableCopies < 1) throw new Error("Book currently unavailable");

    // 2. Check if already borrowed
    const activeBorrow = await BorrowingRecord.findOne({
      user: context.userId,
      book: bookId,
      status: "Borrowed",
    });
    if (activeBorrow) throw new Error("You already have this book borrowed.");

    // 3. Create Record
    const record = new BorrowingRecord({
      user: context.userId,
      book: bookId,
      status: "Borrowed",
    });

    // 4. Update Book & Save
    book.availableCopies -= 1;
    await book.save();
    await record.save();

    // 5. Populate and Return
    const populatedRecord = await BorrowingRecord.findById(record._id)
      .populate("book")
      .populate("user");

    return {
      ...populatedRecord._doc,
      id: populatedRecord._id,
      member: populatedRecord.user,
      borrowDate: new Date(populatedRecord.borrowDate).toISOString(),
    };
  },

  returnBook: async ({ bookId }, context) => {
    checkAuth(context);

    // 1. Find the active record
    const record = await BorrowingRecord.findOne({
      user: context.userId,
      book: bookId,
      status: "Borrowed",
    });

    if (!record) throw new Error("No active borrowing record found.");

    // 2. Update Record
    record.status = "Returned";
    record.returnDate = new Date();
    await record.save();

    // 3. Increment Book Availability
    const book = await Book.findById(bookId);
    book.availableCopies += 1;
    await book.save();

    // 4. Return
    const populatedRecord = await BorrowingRecord.findById(record._id)
      .populate("book")
      .populate("user");

    return {
      ...populatedRecord._doc,
      id: populatedRecord._id,
      member: populatedRecord.user,
      borrowDate: new Date(populatedRecord.borrowDate).toISOString(),
      returnDate: new Date(populatedRecord.returnDate).toISOString(),
    };
  },
};
