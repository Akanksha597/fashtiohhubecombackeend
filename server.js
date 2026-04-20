const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.CONN_STR) {
    throw new Error("Missing CONN_STR in environment variables");
  }

  await mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  isConnected = true;
  console.log("MongoDB Connected");
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};