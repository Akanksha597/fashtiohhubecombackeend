const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.CONN_STR) {
    throw new Error("MongoDB URI missing");
  }

  await mongoose.connect(process.env.CONN_STR);
  isConnected = true;
  console.log("MongoDB Connected");
}

/* Test Route */
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working"
  });
});

/* Export for Vercel */
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};