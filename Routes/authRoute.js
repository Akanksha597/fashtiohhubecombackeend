const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authController = require("../Controller/authController");
const router = express.Router();
const upload = require("../Middleware/upload");
const asyncErrorHandler = require("../Utils/errorHandler");
const User = require("../Models/userModel");
const sendEmail = require("../Utils/email");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendResponse = async (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    user,
    token,
  });
};

router.route("/signup").post(
  upload.single("image"),
  asyncErrorHandler(async (req, res) => {
    try {
      const { name, email, mobile, role, password, confirmPassword, active, address } = req.body;
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All required fields must be provided." });
      }

      let getImageUrl = null;
      if (req.file) {
        try {
          getImageUrl = await uploadFileToFirebase(req.file);
        } catch (uploadError) {
          return res.status(500).json({ message: "Failed to upload image." });
        }
      }

      const newUser = new User({
        name,
        email,
        mobile,
        role,
        password,
        confirmPassword,
        active: active === "true",
        image: getImageUrl,
        address,
      });

      await newUser.save();
      createSendResponse(newUser, 201, res);
    } catch (error) {
      return res.status(500).json({ message: "Error during sign-up." });
    }
  })
);

router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

module.exports = router;
