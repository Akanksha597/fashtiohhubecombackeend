const express = require("express");
const bannerController = require("../Controller/bannerController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");

const router = express.Router();


// ======================================
// PUBLIC ROUTES
// ======================================

// Get all banners
router.get("/", bannerController.getAllBanners);


// ======================================
// ADMIN ROUTES
// ======================================

// Create banner
router.post(
  "/addBanner",
  protect,
  restrict("admin", "superAdmin"),
  upload.single("bannerImage"),
  bannerController.createBanner
);

// Update banner (✅ FIXED: added upload)
router.patch(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  upload.single("bannerImage"),
  bannerController.updateBanner
);

// Delete banner
router.delete(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  bannerController.deleteBanner
);


// ======================================
// ⚠️ KEEP LAST
// ======================================

// Get single banner
router.get("/:id", bannerController.getBanner);


module.exports = router;