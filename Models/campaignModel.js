  const mongoose = require("mongoose");

  const campaignSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
      },
      startDate: {
        type: Date,
        required: [true, "Start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
          validator: function (value) {
            return value > this.startDate;
          },
          message: "End date must be after the start date",
        },
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
        },
      ],
      offers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Offer",
        },
      ],
    },
    { timestamps: true }
  );

  const Campaign = mongoose.model("Campaign", campaignSchema);

  module.exports = Campaign;
