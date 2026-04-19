const mongoose = require("mongoose");
const Product = require("./productModel");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [5, "Coupon code must be at least 5 characters long"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
   
    // discount: {
    //   type: Number,
    //   required: [true, "Discount value is required"],
    //   min: [0, "Discount cannot be negative"],
    //   max: [100, "Discount cannot exceed 100%"],
    // },
    // discountType: {
    //   type: String,
    //   required: [false, "DiscountType value is required"]
    // },
    discount: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
      validate: {
        validator: function (value) {
          // Agar discount type 'percentage' hai toh max 100 allow karo
          if (this.discountType === "percentage") {
            return value <= 100;
          }
          // Fixed amount ke liye koi limit nahi
          return true;
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: ["percentage", "fixed"], // Ensure only valid types are used
    },
  
    startDate:{
      type:Date,
    },
    expirationDate: {
      type: Date,
      required: [false, "Expiration date is required"],
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: "Expiration date must be in the future",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
