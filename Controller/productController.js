const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Product = require("../Models/productModel");
const Category = require("../Models/categoryModel");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Order = require("../Models/orderModel");
const uploadFileToFirebase = require("../Utils/firebaseUpload");

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    // ✅ Parse JSON fields
    if (req.body.tableData) {
      req.body.tableData = JSON.parse(req.body.tableData);
    }

    if (req.body.unitPricePairs) {
      req.body.unitPricePairs = JSON.parse(req.body.unitPricePairs);
    }

    // ✅ Convert values to numbers
    if (req.body.unitPricePairs) {
      req.body.unitPricePairs = req.body.unitPricePairs.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        lisedPrice: Number(item.lisedPrice) || 0,
        minQuantity: Number(item.minQuantity) || 0,
        maxQuentity: Number(item.maxQuentity) || 0,
      }));
    }

    // ✅ 🔥 Upload THUMBNAIL to Firebase
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      const thumbnailUrl = await uploadFileToFirebase(
        req.files.thumbnail[0]
      );
      req.body.thumbnail = thumbnailUrl;
    } else {
      return next(new CustomError("Thumbnail is required", 400));
    }

    // ✅ 🔥 Upload GALLERY to Firebase
    if (req.files?.gallery && req.files.gallery.length > 0) {
      const galleryUrls = await Promise.all(
        req.files.gallery.map((file) =>
          uploadFileToFirebase(file)
        )
      );
      req.body.gallery = galleryUrls;
    } else {
      req.body.gallery = [];
    }

    // ✅ Create Product
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





exports.getProduct = asyncErrorHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const error = new CustomError("Invalid product ID format!", 400);
    return next(error);
  }

  try {
    // Find product by ID and populate its category
    const product = await Product.findById(req.params.id).populate(
      "productCategory",
      "name"
    );

    if (!product) {
      const error = new CustomError(
        "Product with the given ID is not found!",
        404
      );
      return next(error);
    }

    
    res.status(200).json({
      status: "success",
      data: {
        product
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err.message);
    const error = new CustomError(
      "An unexpected error occurred while fetching the product. Please try again later.",
      500
    );
    return next(error);
  }
});

exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      status = "true",
    } = req.query;

    console.log("Request Query Parameters:", {
      keyword,
      minPrice,
      maxPrice,
      page,
      limit,
      status,
    });

    const query = {};

    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
      console.log("Price Query:", query.price);
    }

    // Status filtering
    if (status !== undefined) {
      query.inStock = status.toLowerCase() === "true";
      console.log("Status Query:", query.inStock);
    }

    // Keyword-based filtering for product fields and category
    let categoryIds = [];
    if (keyword) {
      // Fetch matching category IDs based on keyword
      const matchingCategories = await Category.find({
        name: { $regex: keyword, $options: "i" },
      }).select("_id");

      categoryIds = matchingCategories.map((cat) => cat._id);

      query.$or = [
        { productName: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { shortDescription: { $regex: keyword, $options: "i" } },
        { productCategory: { $in: categoryIds } },
      ];
      console.log("Keyword Query:", query.$or);
    }

    // Execute query with pagination
    console.log("Executing Product Query...");
    console.log(query);

    let productsQuery = Product.find(query)
      .populate({
        path: "productCategory",
        match: keyword ? { name: { $regex: keyword, $options: "i" } } : {},
        select: "name",
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const products = await productsQuery;
    console.log("Fetched Products Count:", products.length);

   
    // Fetch total product count for pagination metadata
    const totalProducts = await Product.countDocuments(query);
    console.log("Total Products Count:", totalProducts);

    // Respond with products and pagination metadata
    res.status(200).json({
      success: true,
      products: products,
      pagination: {
        total: totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllProducts Controller:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching products.",
      error: error.message,
    });
  }
});

// update start
exports.findAndUpdateProduct = async (productId, updateData) => {
  try {
    console.log("productId, updateData", productId, updateData);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new CustomError("Invalid product ID format", 400);
    }

    const { _id, qty } = updateData;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      throw new CustomError("Invalid unitPricePairs ID format", 400);
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, "unitPricePairs._id": _id },
      { $set: { "unitPricePairs.$.stock": qty } },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new CustomError(
        "Product or UnitPricePair with given ID is not found",
        404
      );
    }

    return updatedProduct;
  } catch (error) {
    if (error.name === "ValidationError") {
      throw new CustomError(`Validation Error: ${error.message}`, 400);
    }
    if (error.name === "CastError" && error.kind === "ObjectId") {
      throw new CustomError("Invalid ID format", 400);
    }
    console.error("Unexpected error:", error);
    throw new CustomError("An unexpected error occurred", 500);
  }
};

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { thumbnail, gallery } = req.files || {};
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return next(new CustomError("Product with the given ID is not found", 404));
    }

    const updatedData = { ...req.body };

    // Convert Active field to Boolean
    if (updatedData.Active !== undefined) {
      updatedData.Active = updatedData.Active === "true" || updatedData.Active === true;
    }

    console.log("before update status updatedData ::: ", updatedData);

    if (thumbnail && thumbnail.length === 1) {
      updatedData.thumbnail = await uploadFileToFirebase(thumbnail[0]);
    }

   if (gallery && gallery.length > 0) {
  const galleryUrls = await Promise.all(
    gallery.map((file) => uploadFileToFirebase(file))
  );

  updatedData.gallery = galleryUrls;
}

    // Update unitPricePairs
    if (updatedData.unitPricePairs && Array.isArray(updatedData.unitPricePairs)) {
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

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    ).populate("productCategory");

    if (!updatedProduct) {
      return next(new CustomError("Failed to update the product", 500));
    }

    console.log("states of updatedProduct ::: ", updatedProduct.Active);

    res.status(200).json({
      status: "success",
      data: { product: updatedProduct },
    });
  
  } catch (error) {
    next(error);
  }
});



//update end
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
  console.log("requst comes here .....");

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    const error = new CustomError("Product with given ID is not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getProductCount = asyncErrorHandler(async (req, res, next) => {
  const productCount = await Product.countDocuments();
  res.status(200).json({
    status: "success",
    data: {
      count: productCount,
    },
  });
});


exports.getProductSales = asyncErrorHandler(async (req, res, next) => {
  console.log("Product Sales Request Query:", req.query);

  const { page = 1, limit = 10, sortOrder = "desc", search = "" } = req.query;

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
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "productDetails.productCategory",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        totalSales: 1,
        productDetails: 1, // Include the entire productDetails object
        categoryName: "$categoryDetails.name",
      },
    },
    {
      $sort: { totalSales: sortOrder.toLowerCase() === "asc" ? 1 : -1 },
    },
    {
      $facet: {
        metadata: [
          { $count: "totalRecords" },
          {
            $addFields: {
              currentPage: Number(page),
              totalPages: {
                $ceil: { $divide: ["$totalRecords", Number(limit)] },
              },
            },
          },
        ],
        data: [
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
        ],
      },
    },
  ]);

  const result = salesData[0] || { metadata: [], data: [] };

  const metadata = result.metadata[0] || {
    totalRecords: 0,
    currentPage: Number(page),
    totalPages: 0,
  };

  res.status(200).json({
    success: true,
    metadata,
    products: result.data,
  });
});


exports.getProductsByOffer = asyncErrorHandler(async (req, res, next) => {
  try {
    const { offerZone, todayOffer, page = 1, limit = 20 } = req.query;
    
    // Create filter object
    let filter = {};
    if (offerZone !== undefined) {
      filter.offerZone = offerZone === "true";
    }
    if (todayOffer !== undefined) {
      filter.todayOffer = todayOffer === "true";
    }
    
    const skip = (page - 1) * limit;
    const products = await Product.find(filter).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: { 
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
