const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // Main Category Name
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [3, "Category name must be at least 3 characters long"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },

    // Slug (optional useful for URL)
    slug: {
      type: String,
      trim: true,
      unique: true,
    },

    // Description
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot exceed 250 characters"],
    },

    baseDescription: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    sortingPriorityNumber: {
      type: Number,
      default: 0,
      min: [0, "Sorting priority number cannot be negative"],
    },

    thumbnail: {
      type: String,
    },

    Active: {
      type: Boolean,
      default: true,
    },

    // 👇 Main Category / Sub Category
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = Main Category
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;