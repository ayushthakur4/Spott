const mongoose = require("mongoose");
const dotenv = require("dotenv"); // ✅ IMPORT THIS

dotenv.config(); // load env variables

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
