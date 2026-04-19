const mongoose = require("mongoose");

const countSchema = new mongoose.Schema(
  {
     countNumber: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Count = mongoose.model("count", countSchema);

module.exports = Count;
