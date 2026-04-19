const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    shippingName: {
      type: String,
      required: [true, "Shipping name is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAmount: {
      type: Number,
      required: [true, "Shipping amount is required"],
      min: [0, "Shipping amount cannot be negative"],
    },
    shippingAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Shipping = mongoose.model("Shipping", shippingSchema);

module.exports = Shipping;
