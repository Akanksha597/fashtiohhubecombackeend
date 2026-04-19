const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
      unique: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [250, "Short description cannot exceed 250 characters"],
    },
    description: {
      type: String,
      trim: true,
      // maxlength: [500, "Description cannot exceed 500 characters"],
    },
    thumbnail: {
      type: String,
      required: [false, "Product thumbnail is required"],
    },
    gallery: [
    {
    type: String,
    }
    ],
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [false, "Product category is required"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    discountAmount: {
      type: Number,
      min: [0, "Discount amount cannot be negative"],
    },
    discountType: {
      type: String,
    },
    productCode: {
      type: String,
      trim: true,
      unique: true,
      required: [false, "Product code is required"],
    },
    taxTpey:{
      type:String,
      enum :["GST", "VAT"],
      required: [false, "Product tax is required"]
    },
    taxValue:{
     type:Number
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tableData: [
      {
        cropName: {
          type: String,
          required: [false, "Crop name is required"],
          trim: true,
        },
        commonNameOfPest: {
          type: String,
          required: [false, "Common name of pest is required"],
          trim: true,
        },
        dosagePerAcre: {
          type: String,
          required: [false, "Dosage per acre is required"],
          trim: true,
        },
      },
    ],
    unitPricePairs: [
      {
        unit: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          trim: true,
        },
        stock: {
          type: Number,
        },
        lisedPrice: {
          type: Number,
        },
        minQuantity: {
          type: Number,
        },
        maxQuentity: {
          type: Number,
        },
        productimage: {
          type: String,
        },
        isCancel: {
          type: Boolean,
          default: false,
        },
      },
    ],
    Active: {
      type: Boolean,
      default: true,
    },
    todayOffer: {
      type: Boolean,
      default: false,
    },
    offerZone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
