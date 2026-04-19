const Offer = require("../Models/offerModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");

exports.createOffer = asyncErrorHandler(async (req, res, next) => {
  const newOffer = await Offer.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      offer: newOffer,
    },
  });
});

exports.getAllOffers = asyncErrorHandler(async (req, res, next) => {
  const offers = await Offer.find();

  res.status(200).json({
    status: "success",
    results: offers.length,
    data: {
      offers,
    },
  });
});

exports.getOffer = asyncErrorHandler(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id).populate("products");

  if (!offer) {
    return next(new CustomError("Offer not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      offer,
    },
  });
});

exports.updateOffer = asyncErrorHandler(async (req, res, next) => {
  const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedOffer) {
    return next(new CustomError("Offer not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      offer: updatedOffer,
    },
  });
});

exports.deleteOffer = asyncErrorHandler(async (req, res, next) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) {
    return next(new CustomError("Offer not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
