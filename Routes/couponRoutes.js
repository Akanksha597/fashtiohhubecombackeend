const express = require("express");
const couponController = require("../Controller/couponController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();
const upload=require("../Middleware/upload");

router
  .route("/")
  .get(protect, restrict("admin","superAdmin"), couponController.getAllCoupons);
router
  .route("/addCoupon")
  .post(
    protect,
    restrict("admin", "superAdmin"),
    couponController.createCoupon
  );
router
  .route("/:id")
  .get(couponController.getCoupon)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    couponController.updateCoupon
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    couponController.deleteCoupon
  );

  router
  .route("/varify/:code")
  .get(couponController.verifyCouponCode);
module.exports = router;
