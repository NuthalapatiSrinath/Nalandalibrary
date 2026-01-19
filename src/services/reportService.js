const BorrowingRecord = require("../models/BorrowingRecord");
const Book = require("../models/Book");

// @desc    Report 1: Top 10 Most Borrowed Books
// @use     $group, $lookup, $project
exports.getMostBorrowedBooks = async () => {
  return await BorrowingRecord.aggregate([
    // 1. Group by Book ID and count occurrences
    {
      $group: {
        _id: "$book",
        count: { $sum: 1 },
      },
    },
    // 2. Sort by count (Highest first)
    { $sort: { count: -1 } },
    // 3. Limit to top 10
    { $limit: 10 },
    // 4. Join with Books collection to get titles
    {
      $lookup: {
        from: "books", // MongoDB collection name (lowercase plural)
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
    // 5. Unwind array (since lookup returns an array)
    { $unwind: "$bookDetails" },
    // 6. Format the output
    {
      $project: {
        _id: 1,
        title: "$bookDetails.title",
        author: "$bookDetails.author",
        count: 1,
      },
    },
  ]);
};

// @desc    Report 2: Most Active Members
// @use     $group, $lookup, $sort
exports.getActiveMembers = async () => {
  return await BorrowingRecord.aggregate([
    // 1. Group by User ID
    {
      $group: {
        _id: "$user", // Note: Schema uses 'user', not 'member'
        borrowCount: { $sum: 1 },
      },
    },
    // 2. Sort by activity
    { $sort: { borrowCount: -1 } },
    // 3. Limit to top 5
    { $limit: 5 },
    // 4. Join with Users collection
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        name: "$userDetails.name",
        email: "$userDetails.email",
        borrowCount: 1,
      },
    },
  ]);
};

// @desc    Report 3: Book Availability Summary
// @use     $group (on Books collection)
exports.getBookAvailability = async () => {
  return await Book.aggregate([
    {
      $group: {
        _id: null, // Group all documents into one result
        totalBooks: { $sum: "$copies" },
        totalAvailable: { $sum: "$availableCopies" },
        totalTitles: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalBooks: 1,
        totalAvailable: 1,
        totalTitles: 1,
        totalBorrowed: { $subtract: ["$totalBooks", "$totalAvailable"] },
      },
    },
  ]);
};
