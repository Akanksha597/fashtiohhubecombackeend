const Category = require("../Models/categoryModel");
const Product = require("../Models/productModel");
const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");


// ======================================
// CREATE CATEGORY
// ======================================
exports.createCategory = asyncErrorHandler(async (req, res) => {
  const {
    name,
    description,
    parentCategory,
    brand,
    baseDescription,
    sortingPriorityNumber,
  } = req.body;

  // 📸 Cloudinary image
  const thumbnail = req.file ? req.file.path : null;

  const category = await Category.create({
    name,
    description,
    parentCategory: parentCategory || null,
    brand,
    baseDescription,
    sortingPriorityNumber,
    thumbnail,
  });

  res.status(201).json({
    status: "success",
    data: category,
  });
});


// ======================================
// GET ALL CATEGORY
// ======================================
exports.getAllCategories = asyncErrorHandler(async (req, res) => {
  const categories = await Category.find()
    .populate("parentCategory", "name")
    .sort({ sortingPriorityNumber: 1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: categories,
  });
});


// ======================================
// GET MAIN CATEGORY
// ======================================
exports.getMainCategories = asyncErrorHandler(async (req, res) => {
  const categories = await Category.find({
    parentCategory: null,
    Active: true,
  }).sort({ name: 1 });

  res.status(200).json({
    status: "success",
    data: categories,
  });
});


// ======================================
// GET SUB CATEGORY
// ======================================
exports.getSubCategories = asyncErrorHandler(async (req, res) => {
  const categories = await Category.find({
    parentCategory: req.params.id,
    Active: true,
  }).sort({ name: 1 });

  res.status(200).json({
    status: "success",
    data: categories,
  });
});


// ======================================
// GET SINGLE CATEGORY
// ======================================
exports.getCategory = asyncErrorHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate(
    "parentCategory",
    "name"
  );

  if (!category) {
    return next(new CustomError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});


// ======================================
// UPDATE CATEGORY
// ======================================
exports.updateCategory = asyncErrorHandler(async (req, res, next) => {
  const data = { ...req.body };

  // 📸 Cloudinary image update
  if (req.file) {
    data.thumbnail = req.file.path;
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new CustomError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});


// ======================================
// DELETE CATEGORY
// ======================================
exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new CustomError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Deleted successfully",
  });
});


// ======================================
// CATEGORY COUNT
// ======================================
exports.getCategoryCount = asyncErrorHandler(async (req, res) => {
  const count = await Category.countDocuments();

  res.status(200).json({
    status: "success",
    data: { count },
  });
});


// ======================================
// CATEGORY SALES
// ======================================
exports.getCategorySales = asyncErrorHandler(async (req, res) => {
  const data = await Product.aggregate([
    {
      $group: {
        _id: "$productCategory",
        totalProducts: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data,
  });
});