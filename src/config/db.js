const mongoose = require("mongoose");
const config = require("./index"); // Import from our new config file

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
