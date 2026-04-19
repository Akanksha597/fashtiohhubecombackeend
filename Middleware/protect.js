const User = require("../Models/userModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");
const util = require("util");
const jwt = require("jsonwebtoken");

exports.protect = asyncErrorHandler(async (req, res, next) => {
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("You are not logged in !", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  const user = await User.findById(decodedToken.id);  
  if (!user) {
    const err = new CustomError(
      "The user with given token does not exist",
      401
    );
    next(err);
  }
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const err = new CustomError(
      "The password has changed recently.Please login again",
      401
    );
    return next(err);
  }
  req.user = user;
  next();
});

 