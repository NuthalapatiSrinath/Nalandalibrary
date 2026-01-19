const dotenv = require("dotenv");

// Load .env file
dotenv.config();

// Validation: Ensure critical variables exist
const requiredEnvs = ["MONGO_URI", "JWT_SECRET", "JWT_ENCRYPTION_KEY"];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ FATAL ERROR: Missing ${key} in .env file`);
    process.exit(1);
  }
});

// Export clean configuration object
module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.JWT_ENCRYPTION_KEY,
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};
