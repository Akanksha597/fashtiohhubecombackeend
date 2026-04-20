const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Product = require("../Models/productModel");
const Category = require("../Models/categoryModel");
const mongoose = require("mongoose");
const Order = require("../Models/orderModel");


// ==========================
// 🚀 CREATE PRODUCT
// ==========================
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    // ✅ Parse JSON fields
    if (req.body.tableData) {
      req.body.tableData = JSON.parse(req.body.tableData);
    }

    if (req.body.unitPricePairs) {
      req.body.unitPricePairs = JSON.parse(req.body.unitPricePairs);

      req.body.unitPricePairs = req.body.unitPricePairs.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        lisedPrice: Number(item.lisedPrice) || 0,
        minQuantity: Number(item.minQuantity) || 0,
        maxQuentity: Number(item.maxQuentity) || 0,
      }));
    }

    // ==========================
    // 📸 CLOUDINARY IMAGES
    // ==========================

    if (req.files?.thumbnail?.length > 0) {
      req.body.thumbnail = req.files.thumbnail[0].path;
    } else {
      return next(new CustomError("Thumbnail is required", 400));
    }

    if (req.files?.gallery?.length > 0) {
      req.body.gallery = req.files.gallery.map((file) => file.path);
    } else {
      req.body.gallery = [];
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    return next(new CustomError(error.message, 400));
  }
});


// ==========================
// 📦 GET SINGLE PRODUCT
// ==========================
exports.getProduct = asyncErrorHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new CustomError("Invalid product ID format!", 400));
  }

  const product = await Product.findById(req.params.id).populate(
    "productCategory",
    "name"
  );

  if (!product) {
    return next(new CustomError("Product not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: { product },
  });
});


// ==========================
// 📦 GET ALL PRODUCTS
// ==========================
exports.getAllProducts = asyncErrorHandler(async (req, res) => {
  const {
    keyword,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    status = "true",
  } = req.query;

  const query = {};

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (status !== undefined) {
    query.inStock = status === "true";
  }

  if (keyword) {
    const categories = await Category.find({
      name: { $regex: keyword, $options: "i" },
    }).select("_id");

    const categoryIds = categories.map((c) => c._id);

    query.$or = [
      { productName: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { shortDescription: { $regex: keyword, $options: "i" } },
      { productCategory: { $in: categoryIds } },
    ];
  }

  const products = await Product.find(query)
    .populate("productCategory", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  });
});


// ==========================
// 🔄 UPDATE PRODUCT
// ==========================
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  const productId = req.params.id;

  const existingProduct = await Product.findById(productId);
  if (!existingProduct) {
    return next(new CustomError("Product not found", 404));
  }

  const updatedData = { ...req.body };

  // Boolean fix
  if (updatedData.Active !== undefined) {
    updatedData.Active =
      updatedData.Active === "true" || updatedData.Active === true;
  }

  const { thumbnail, gallery } = req.files || {};

  // 📸 Update Thumbnail
  if (thumbnail?.length === 1) {
    updatedData.thumbnail = thumbnail[0].path;
  }

  // 📸 Update Gallery
  if (gallery?.length > 0) {
    updatedData.gallery = gallery.map((file) => file.path);
  }

  // 🔄 Update unitPricePairs
  if (updatedData.unitPricePairs) {
    updatedData.unitPricePairs = JSON.parse(updatedData.unitPricePairs);

    await Promise.all(
      updatedData.unitPricePairs.map(async (pair) => {
        if (pair._id && mongoose.Types.ObjectId.isValid(pair._id)) {
          await Product.updateOne(
            { _id: productId, "unitPricePairs._id": pair._id },
            { $set: { "unitPricePairs.$": pair } }
          );
        } else {
          await Product.findByIdAndUpdate(productId, {
            $push: { unitPricePairs: pair },
          });
        }
      })
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updatedData,
    { new: true }
  ).populate("productCategory");

  res.status(200).json({
    status: "success",
    data: { product: updatedProduct },
  });
});


// ==========================
// ❌ DELETE PRODUCT
// ==========================
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new CustomError("Product not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});


// ==========================
// 📊 PRODUCT COUNT
// ==========================
exports.getProductCount = asyncErrorHandler(async (req, res) => {
  const count = await Product.countDocuments();

  res.status(200).json({
    status: "success",
    data: { count },
  });
});


// ==========================
// 📈 PRODUCT SALES
// ==========================
exports.getProductSales = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 10, sortOrder = "desc" } = req.query;

  const salesData = await Order.aggregate([
    { $unwind: "$dbCart" },
    {
      $group: {
        _id: "$dbCart.productId",
        totalSales: { $sum: "$dbCart.qty" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $sort: { totalSales: sortOrder === "asc" ? 1 : -1 },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: Number(limit),
    },
  ]);

  res.status(200).json({
    success: true,
    products: salesData,
  });
});


// ==========================
// 🎯 PRODUCTS BY OFFER
// ==========================
exports.getProductsByOffer = asyncErrorHandler(async (req, res) => {
  const { offerZone, todayOffer, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (offerZone !== undefined) {
    filter.offerZone = offerZone === "true";
  }

  if (todayOffer !== undefined) {
    filter.todayOffer = todayOffer === "true";
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    status: "success",
    data: {
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});