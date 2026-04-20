const Banner = require("../Models/bannerModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");


// ==========================
// 🚀 CREATE BANNER
// ==========================
exports.createBanner = asyncErrorHandler(async (req, res, next) => {

  // 📸 Cloudinary image
  const imageUrl = req.file ? req.file.path : null;

  const newBanner = await Banner.create({
    ...req.body,
    bannerImage: imageUrl,
  });

  res.status(201).json({
    status: "success",
    data: {
      banner: newBanner,
    },
  });
});


// ==========================
// 📦 GET ALL BANNERS
// ==========================
exports.getAllBanners = asyncErrorHandler(async (req, res, next) => {
  const { page, limit, fetchAll, search, pageType } = req.query;

  const searchQuery = {};

  // Filter by page type
  if (pageType) {
    searchQuery.PageWiseBanner = pageType;
  }

  // Search filter
  if (search) {
    searchQuery.$or = [
      { bannerType: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { bannerText: { $regex: search, $options: "i" } },
      { PageWiseBanner: { $regex: search, $options: "i" } },
      { redirectLink: { $regex: search, $options: "i" } },
    ];
  }

  // Fetch all
  if (fetchAll === "true") {
    const banners = await Banner.find(searchQuery);
    return res.status(200).json({
      status: "success",
      results: banners.length,
      data: { banners },
    });
  }

  // Pagination
  const skip = page ? (page - 1) * limit : 0;

  const banners = await Banner.find(searchQuery)
    .skip(skip)
    .limit(limit ? Number(limit) : 0);

  const total = await Banner.countDocuments(searchQuery);

  res.status(200).json({
    status: "success",
    results: banners.length,
    total,
    currentPage: page ? Number(page) : null,
    totalPages: page && limit ? Math.ceil(total / limit) : null,
    data: { banners },
  });
});


// ==========================
// 📦 GET SINGLE BANNER
// ==========================
exports.getBanner = asyncErrorHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new CustomError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { banner },
  });
});


// ==========================
// 🔄 UPDATE BANNER
// ==========================
exports.updateBanner = asyncErrorHandler(async (req, res, next) => {
  const data = { ...req.body };

  // 📸 Update image if provided
  if (req.file) {
    data.bannerImage = req.file.path;
  }

  const updatedBanner = await Banner.findByIdAndUpdate(
    req.params.id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedBanner) {
    return next(new CustomError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      banner: updatedBanner,
    },
  });
});


// ==========================
// ❌ DELETE BANNER
// ==========================
exports.deleteBanner = asyncErrorHandler(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new CustomError("Banner not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});