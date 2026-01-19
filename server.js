// server.js
require("dotenv").config(); // Load env variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Initialize App
const app = express();

// Middleware (Security & Parsing)
app.use(helmet()); // Secure HTTP headers
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Log requests to console

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  }
};

// Basic Route
app.get("/", (req, res) => {
  res.send("Welcome to Nalanda Library API");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
