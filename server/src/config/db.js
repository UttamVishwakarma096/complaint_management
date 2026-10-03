const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to DB");
  } catch (error) {
    console.log(`Error msg: ${error.message}`);
  }
}

module.exports = connectDB;
