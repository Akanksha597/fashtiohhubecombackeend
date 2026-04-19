const Campaign = require("../Models/campaignModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");

exports.createCampaign = asyncErrorHandler(async (req, res, next) => {
  const {
    title,
    startDate,
    endDate,
    isActive,
    offers,
    products,
  } = req.body;

  const formattedProducts = products?.map((product) => ({
    product: product.product,
    }));

  const newCampaign = await Campaign.create({
    title,
    startDate,
    endDate,
    isActive,
    offers,
    products: formattedProducts,
  });

  res.status(201).json({
    status: "success",
    data: {
      campaign: newCampaign,
    },
  });
});

exports.getAllCampaigns = asyncErrorHandler(async (req, res, next) => {
  const { search, page, limit } = req.query;
  const searchQuery = {};

  if (search) {
    searchQuery.$or = [
      { title: { $regex: search, $options: "i" } },
      { "products.product": { $regex: search, $options: "i" } },
    ];
  }

  const skip = page ? (page - 1) * limit : 0; 
  const campaignQuery = Campaign.find(searchQuery);

  if (page && limit) {
    campaignQuery.skip(skip).limit(parseInt(limit));
  }

  const campaignsList = await campaignQuery.populate("products.product", "productName").populate("offers");
  const total = await Campaign.countDocuments(searchQuery);

  res.status(200).json({
    status: "success",
    results: campaignsList.length,
    total,
    currentPage: page ? parseInt(page) : null,
    totalPages: page && limit ? Math.ceil(total / limit) : null,
    data: {
      campaignsList,
    },
  });
});

exports.getCampaign = asyncErrorHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(new CustomError("Campaign not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      campaign,
    },
  });
});

exports.updateCampaign = asyncErrorHandler(async (req, res, next) => {
  const updatedCampaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCampaign) {
    return next(CustomError("Campaign not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      campaign: updatedCampaign,
    },
  });
});

exports.deleteCampaign = asyncErrorHandler(async (req, res, next) => {
  const campaign = await Campaign.findByIdAndDelete(req.params.id);

  if (!campaign) {
    return next(new Error("Campaign not found"));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
