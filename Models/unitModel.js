const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: [true, "Unit name is required"],
      trim: true,
      maxlength: [10, "Unit name cannot exceed 10 characters"], // Updated message
    },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);

module.exports = Unit;
