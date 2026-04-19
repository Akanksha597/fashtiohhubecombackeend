const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Coupon = require("../Models/couponModel");

exports.createCoupon = asyncErrorHandler(async (req, res) => {
  const {
    name,
    code,
    startDate,
    discount,
    discountType,
    expirationDate,
    isActive,
  } = req.body;

  const coupon = await Coupon.create({
    name,
    code,
    startDate,
    discount,
    discountType,
    expirationDate,
    isActive,
  });

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

exports.getCoupon = asyncErrorHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    const error = new CustomError(
      "Coupon with the given ID is not found!",
      404
    );
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
  });
});

exports.getAllCoupons = asyncErrorHandler(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: "success",
    result: coupons.length,
    data: {
      coupons,
    },
  });
});

exports.updateCoupon = asyncErrorHandler(async (req, res, next) => {
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedCoupon) {
    const error = new CustomError("Coupon with the given ID is not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      coupon: updatedCoupon,
    },
  });
});

exports.deleteCoupon = asyncErrorHandler(async (req, res, next) => {
  const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!deletedCoupon) {
    const error = new CustomError("Coupon with the given ID is not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.verifyCouponCode = asyncErrorHandler(async (req, res, next) => {
  const { code, email, mobile } = req.params;

  const coupon = await Coupon.findOne({ code });
  console.log("Coupon:", coupon);

  if (!coupon) {
    return next(
      new CustomError("Coupon with the given code is not found!", 404)
    );
  }

  if (!coupon.isActive) {
    return next(new CustomError("This coupon is inactive!", 400));
  }

  const currentDate = new Date();
  if (
    currentDate < new Date(coupon.startDate) ||
    currentDate > new Date(coupon.expirationDate)
  ) {
    return next(
      new CustomError("This coupon is expired or not yet valid!", 400)
    );
  }

  if (!email && !mobile) {
    return next(
      new CustomError(
        "Email or mobile number is required to verify the coupon.",
        400
      )
    );
  }

  const userQuery = {};
  if (email) userQuery.customerEmail = email;
  if (mobile) userQuery.customerPhoneNumber = mobile;

  userQuery.coupon = coupon._id;
  const existingOrder = await Order.findOne(userQuery);

  if (existingOrder) {
    return next(
      new CustomError("This coupon has already been used by this user.", 400)
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
    message: "Coupon code is valid and not used by this user!",
  });
});
