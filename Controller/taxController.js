const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Tax = require("../Models/taxModel");

exports.createTax = asyncErrorHandler(async (req, res, next) => {
  const tax = await Tax.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tax,
    },
  });
});

exports.getTax = asyncErrorHandler(async (req, res, next) => {
  const tax = await Tax.findById(req.params.id);
  if (!tax) {
    return next(new CustomError("Tax with given ID is not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tax,
    },
  });
});

exports.getAllTaxes = asyncErrorHandler(async (req, res, next) => {
  const taxes = await Tax.find();
  res.status(200).json({
    status: "success",
    result: taxes.length,
    data: {
      taxes,
    },
  });
});

exports.updateTax = asyncErrorHandler(async (req, res, next) => {
  const updatedTax = await Tax.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTax) {
    return next(new CustomError("Tax with given ID is not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tax: updatedTax,
    },
  });
});

exports.deleteTax = asyncErrorHandler(async (req, res, next) => {
  const deletedTax = await Tax.findByIdAndDelete(req.params.id);
  if (!deletedTax) {
    return next(new CustomError("Tax with given ID is not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
