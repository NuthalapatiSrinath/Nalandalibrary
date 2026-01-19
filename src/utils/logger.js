const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

// Define transports based on environment
const transports = [
  // Always log to console
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
];

// Only add File transports if NOT in production
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
  );
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
    }),
  );
}

// Create the Logger
const logger = winston.createLogger({
  format: logFormat,
  transports: transports,
});

module.exports = logger;
