const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Shipping = require("../Models/shippingModel");

// Create a new shipping entry
exports.createShipping = asyncErrorHandler(async (req, res, next) => {
  const shipping = await Shipping.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      shipping,
    },
  });
});

// Get a specific shipping entry by ID
exports.getShipping = asyncErrorHandler(async (req, res, next) => {
  const shipping = await Shipping.findById(req.params.id);
  if (!shipping) {
    const error = new CustomError("Shipping with the given ID is not found!", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      shipping,
    },
  });
});

exports.getAllShipping = asyncErrorHandler(async (req, res, next) => {
    const { page = 1, limit = 10, keyword } = req.query;
  
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
  
    // Validate pagination inputs
    if (isNaN(pageNumber) || pageNumber <= 0) {
      return next(
        new CustomError("Invalid page number. Must be a positive integer.", 400)
      );
    }
  
    if (isNaN(limitNumber) || limitNumber <= 0) {
      return next(
        new CustomError("Invalid limit number. Must be a positive integer.", 400)
      );
    }
  
    // Build query: Add keyword-based search only if keyword is provided
    const query = keyword
      ? {
          $or: [
            { shippingName: { $regex: keyword, $options: "i" } },
            { status: { $regex: keyword, $options: "i" } },
          ],
        }
      : {}; // No filters applied if keyword is not provided
  
    try {
      const skip = (pageNumber - 1) * limitNumber;
  
      // Fetch filtered and paginated shipping records
      const shippingEntries = await Shipping.find(query)
        .skip(skip)
        .limit(limitNumber);
  
      const totalShipping = await Shipping.countDocuments(query);
  
      res.status(200).json({
        status: "success",
        result: shippingEntries.length,
        page: pageNumber,
        totalPages: Math.ceil(totalShipping / limitNumber),
        totalShipping,
        data: {
          shippingEntries,
        },
      });
    } catch (error) {
      console.error("Error fetching shipping entries:", error.message);
      return next(
        new CustomError("An error occurred while fetching shipping entries.", 500)
      );
    }
  });
  
exports.updateShipping = asyncErrorHandler(async (req, res, next) => {
  const updatedShipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedShipping) {
    const error = new CustomError("Shipping with the given ID is not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      shipping: updatedShipping,
    },
  });
});


exports.deleteShipping = asyncErrorHandler(async (req, res, next) => {
  const deletedShipping = await Shipping.findByIdAndDelete(req.params.id);
  if (!deletedShipping) {
    const error = new CustomError("Shipping with the given ID is not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
