
const asyncErrorHandler = require("../Utils/errorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../Utils/customError");
const User = require("../Models/userModel");
const sendEmail = require("../Utils/email");
const crypto = require("crypto");
const RolesPermissions = require("../Models/rolesPermissionsModel");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendResponse = async (user, statusCode, res) => {
  const token = signToken(user._id);
  const options = {
    maxAge: process.env.COOKIE_MAX_AGE,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") options.secure = true;

  res.cookie("jwt", token, options);
  let permissions = {};
  try {
    const roleData = await RolesPermissions.findOne({ role: user.role });
    if (roleData) {
      permissions = roleData.permissions;
    }
  } catch (error) {
    console.error("Error fetching role permissions:", error);
  }
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    user,
    token,
    permissions,
  });
};

exports.signUp = asyncErrorHandler(async (req, res) => {
  
  const {
    name,
    email,
    mobile,
    role,
    password,
    confirmPassword,
    active,
  } = req.body;

  const newUser = await User.create({
    name,
    email,
    mobile,
    role,
    password,
    confirmPassword,
    active,
    image: req.file ? req.file.path : null 
  });
  
  createSendResponse(newUser, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new CustomError(
      "Please provide email ID and password for login in!",
      400
    );
    return next(err);
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    const err = new CustomError("Incorrect email or password", 400);
    return next(err);
  }
  createSendResponse(user, 200, res);
});

exports.logout = asyncErrorHandler(async (req, res, next) => {});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new CustomError(
      "We could not find the user  with given email",
      404
    );
    next(error);
  }
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\n This reset password link will be valid only for 10 min`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password change request received",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "password reset link send to the user email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new CustomError(
        "There was an error sending password reset email. Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid or has expired!", 400);
    return next(error);
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  createSendResponse(user, 200, res);
});
