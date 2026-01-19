const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Log the error for the developer
  logger.error(`${err.name}: ${message}`);

  // --- Specific Error Handling ---

  // 1. Mongoose: Bad ObjectId (e.g., /api/books/invalid-id)
  if (err.name === "CastError") {
    message = `Resource not found. Invalid ID: ${err.value}`;
    statusCode = 404;
  }

  // 2. Mongoose: Duplicate Key (e.g., Registering email that exists)
  if (err.code === 11000) {
    message = "Duplicate field value entered. Please use another value.";
    statusCode = 400;
  }

  // 3. Mongoose: Validation Error (e.g., Missing required field)
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // 4. JWT: Invalid Token
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again.";
    statusCode = 401;
  }

  // 5. JWT: Expired Token
  if (err.name === "TokenExpiredError") {
    message = "Your session has expired. Please log in again.";
    statusCode = 401;
  }

  // Send the response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, // Hide stack in prod
  });
};

module.exports = errorHandler;
