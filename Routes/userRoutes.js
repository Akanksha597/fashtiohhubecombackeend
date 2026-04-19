const express = require("express");
const { protect } = require("../Middleware/protect");
const userController = require("../Controller/userController");
const { restrict } = require("../Middleware/restrict");
const userRouter = express.Router();

userRouter.get("/", protect, userController.getUser);
userRouter.get(
  "/getAllUsers",
  protect,
  restrict("admin", "superAdmin"),
  userController.getAllUsers
);

userRouter
  .route("/updatePassword")
  .patch(protect, userController.updatePassword);
userRouter.route("/updateMe").patch(protect, userController.updateMe);
userRouter.route("/deleteMe").delete(protect, userController.deleteMe);

module.exports = userRouter;
