const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.CONN_STR) {
    throw new Error("MongoDB URI missing");
  }

  await mongoose.connect(process.env.CONN_STR);
  isConnected = true;
  console.log("✅ MongoDB Connected");
}

module.exports = async (req, res) => {
  try {
    await connectDB();

    // 🔥 THIS LINE IS THE MOST IMPORTANT
    return app(req, res);

  } catch (error) {
    console.error("❌ Server Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};