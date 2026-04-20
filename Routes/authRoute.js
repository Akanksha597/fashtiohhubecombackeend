const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authController = require("../Controller/authController");
const asyncErrorHandler = require("../Utils/errorHandler");
const upload = require("../Middleware/upload");
const User = require("../Models/userModel");
const sendEmail = require("../Utils/email");

const router = express.Router();


// 🔐 Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};


// 🍪 Send Token + Response
const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  // Optional: Cookie (recommended)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};


// ==========================
// 🚀 SIGNUP
// ==========================
router.post(
  "/signup",
  upload.single("image"),
  asyncErrorHandler(async (req, res) => {
    const {
      name,
      email,
      mobile,
      role,
      password,
      confirmPassword,
      active,
      address,
    } = req.body;

    // 🔍 Required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "All required fields must be provided",
      });
    }

    // 🔐 Password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // 🚫 Prevent duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already registered",
      });
    }

    // 📸 Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;

    // 👤 Create user
    const newUser = await User.create({
      name,
      email,
      mobile,
      role,
      password,
      confirmPassword,
      active: active === "true",
      image: imageUrl,
      address,
    });

    createSendResponse(newUser, 201, res);
  })
);


// ==========================
// 🔑 LOGIN / LOGOUT
// ==========================
router.post("/login", authController.login);
router.post("/logout", authController.logout);


// ==========================
// 🔁 FORGOT PASSWORD
// ==========================
router.post(
  "/forgotPassword",
  asyncErrorHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with this email",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `Reset your password:\n${resetURL}\nIgnore if not requested.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Reset link sent to email",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: "error",
        message: "Email sending failed",
      });
    }
  })
);


// ==========================
// 🔁 RESET PASSWORD
// ==========================
router.patch(
  "/resetPassword/:token",
  asyncErrorHandler(async (req, res) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token invalid or expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendResponse(user, 200, res);
  })
);

module.exports = router;