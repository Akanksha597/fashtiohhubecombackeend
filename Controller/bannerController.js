const Banner = require("../Models/bannerModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");
const uploadFileToFirebase = require("../Utils/firebaseUpload");

// Create a new banner
exports.createBanner = asyncErrorHandler(async (req, res, next) => {
  let getImageUrl;
  if (req.file) {
    getImageUrl = await uploadFileToFirebase(req.file);
  }

  // Include redirectLink from the request body
  const newBanner = await Banner.create({
    ...req.body,
    bannerImage: getImageUrl ? getImageUrl : null,
  });

  res.status(201).json({
    status: "success",
    data: {
      banner: newBanner,
    },
  });
});

// Get all banners with pagination or fetch by PageWiseBanner (pageType)
exports.getAllBanners = asyncErrorHandler(async (req, res, next) => {
  const { page, limit, fetchAll, search, pageType } = req.query;

  // Create a search query
  const searchQuery = {};

  // Filter by pageType (PageWiseBanner)
  if (pageType) {
    searchQuery.PageWiseBanner = pageType;  // PageWiseBanner is the field we use to filter banners by page type
  }

  if (search) {
    searchQuery.$or = [
      { bannerImage: { $regex: search, $options: "i" } },
      { bannerType: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { bannerText: { $regex: search, $options: "i" } },
      { PageWiseBanner: { $regex: search, $options: "i" } },
      { redirectLink: { $regex: search, $options: "i" } },  // Allow searching by redirectLink
    ];
  }

  if (fetchAll === "true") {
    const banners = await Banner.find(searchQuery);
    return res.status(200).json({
      status: "success",
      results: banners.length,
      data: {
        banners,
      },
    });
  }

  const skip = page ? (page - 1) * limit : 0;
  const bannerQuery = Banner.find(searchQuery);

  if (page && limit) {
    bannerQuery.skip(skip).limit(parseInt(limit));
  }

  const banners = await bannerQuery;
  const total = await Banner.countDocuments(searchQuery);

  res.status(200).json({
    status: "success",
    results: banners.length,
    total,
    currentPage: page ? parseInt(page) : null,
    totalPages: page && limit ? Math.ceil(total / limit) : null,
    data: {
      banners,
    },
  });
});

// Get a single banner
exports.getBanner = asyncErrorHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new CustomError("Banner not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      banner,
    },
  });
});

// Update a banner
exports.updateBanner = asyncErrorHandler(async (req, res, next) => {
  const updatedBanner = await Banner.findByIdAndUpdate(
    req.params.id,
    req.body, // Include the redirectLink if it's in the request body
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

// Delete a banner
exports.deleteBanner = asyncErrorHandler(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    return next(new CustomError("Banner not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: banner,
  });
});
