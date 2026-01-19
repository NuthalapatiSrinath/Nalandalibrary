const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    ISBN: { type: String, required: true, unique: true },
    publicationDate: { type: Date, required: true },
    genre: { type: String, required: true },
    copies: { type: Number, required: true, min: 0 },
    // We will use this virtual or logic to track availability
    availableCopies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Book", bookSchema);
