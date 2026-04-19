const CustomError = require("../Utils/customError");

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};
const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Some thing went wrong please try again later!",
    });
  }
};
const castError = (error) => {
  const msg = `Invalid value for ${error.path} :${error.value}!`;
  return new CustomError(msg, 400);
};
const duplicateKeyErrorHandler = (err) => {
  const key = Object.keys(err.keyValue).join(" & ");
  const msg = `${key} already exist`;
  return new CustomError(msg, 400);
};
const validationError = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessages = errors.join(". ");
  const msg = `Invalid input data ${errorMessages}`;
  return new CustomError(msg, 400);
};
const handleExpiredJwt = (err) => {
  return new CustomError("Jwt has expired please login again!", 403);
};
const handleJwtError = (err) => {
  return new CustomError("Invalid token.please login again!", 401);
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") error = castError(error);
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationError(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJwt(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError(error);
    prodErrors(res, error);
  }
};
