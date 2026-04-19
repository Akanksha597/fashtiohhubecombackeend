const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
    },
    dbCart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required"],
        },
        qty: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Quantity cannot be less than 1"],
        },
        unit: {
          type: String,
          required: [true, "Unit is required"],
        },
        price: {
          type: Number,
        },
      },
    ],
    courierId: {
      type:String,
      required: [false, "Courier ID is required"],
    },
    courierType: {
      type: String,
      required: [false, "Courier type is required"],
    },
    grandTotal: {
      type: Number,
    },
    courierType: {
      type: String,
    },
    totalItems: {
      type: Number,
    },
    paymentReferenceId: {
      type: Number,
    },
    orderType: {
      type: String,
      enum: ["Scheduled", "Regular", "Pending"],
      default: "Pending",
    },
    placedOn: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    customerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    discountAmount: {
      type: Number,
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "UPI", "Cash on Delivery"],
      required: [false, "Payment method is required"],
    },
    paymentMode: {
      type: String,
      enum: ["cod", "online"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    shippingAddress: {
      addressLine1: { type: String, required: false },
      addressLine2: { type: String },
      city: { type: String, required: false },
      state: { type: String, required: false },
      country: { type: String, required: false },
      pincode: { type: String, required: false },
    },
    shippingAmount: {
      type: Number,
    },
    customerEmail: {
      type: String,
    },
    customerPhoneNumber: {
      type: String,
    },
    rejectedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    dispatchedAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "CONFIRMED",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
        "FAILED",
        "RETURNED",
        "ON_HOLD",
        "COMPLETED",
        "NEW",
        "ORDERED",
      
      ],
      default: "PENDING",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    rejectedReason: {
      type: String,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },

    paymentScrennshot: {
      type: String,
    },
    accountDetails: {
      accountHolderName: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      bankName: {
        type: String,
      },
      branchName: {
        type: String,
      },
      ifscCode: {
        type: String,
      },
      mobileNumber: {
        type: String,
      },
      upiId: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
