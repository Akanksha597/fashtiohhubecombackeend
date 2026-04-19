const express = require("express");
const bannerController = require("../Controller/bannerController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();
const upload = require("../Middleware/upload");
// Route to get all banners with pagination or fetch all at once
router.route("/").get(bannerController.getAllBanners);

// Route to create a new banner
router
  .route("/addBanner")
  .post(
    protect,
    restrict("admin", "superAdmin"),
    upload.single("bannerImage"),
    bannerController.createBanner
  );

// Routes for specific banner operations (get, update, delete)
router
  .route("/:id")
  .get(bannerController.getBanner)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    bannerController.updateBanner
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    bannerController.deleteBanner
  );

module.exports = router;