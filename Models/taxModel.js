const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    taxName: {
      type: String,
      required: [true, "Tax name is required"],
      trim: true,
      maxlength: [50, "Tax name cannot exceed 50 characters"], 
    },
    active: {
      type: Boolean,
      default: true, 
    },
  },
  { timestamps: true }
);

const Tax = mongoose.model("Tax", taxSchema);

module.exports = Tax;
