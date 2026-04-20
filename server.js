const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.CONN_STR) {
    throw new Error("❌ CONN_STR missing");
  }

  try {
    await mongoose.connect(process.env.CONN_STR);
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB ERROR:", err.message);
    throw err;
  }
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    return res.json({ message: "DB Connected" });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};