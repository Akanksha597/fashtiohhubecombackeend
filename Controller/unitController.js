const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Unit = require("../Models/unitModel");

exports.createUnit = asyncErrorHandler(async (req, res, next) => {
  const unit = await Unit.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      unit,
    },
  });
});

exports.getUnit = asyncErrorHandler(async (req, res, next) => {
  const unit = await Unit.findById(req.params.id);
  if (!unit) {
    return next(new CustomError("Unit with given ID is not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      unit,
    },
  });
});

exports.getAllUnits = asyncErrorHandler(async (req, res, next) => {
  const units = await Unit.find();
  res.status(200).json({
    status: "success",
    result: units.length,
    data: {
      units,
    },
  });
});

exports.updateUnit = asyncErrorHandler(async (req, res, next) => {
  const updatedUnit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedUnit) {
    return next(new CustomError("Unit with given ID is not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      unit: updatedUnit,
    },
  });
});

exports.deleteUnit = asyncErrorHandler(async (req, res, next) => {
  const deletedUnit = await Unit.findByIdAndDelete(req.params.id);
  if (!deletedUnit) {
    return next(new CustomError("Unit with given ID is not found", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
