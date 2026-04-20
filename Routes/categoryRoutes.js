const express = require("express");
const router = express.Router();

const categoryController = require("../Controller/categoryController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");


// ======================================
// PUBLIC ROUTES
// ======================================

// Get all categories
router.get("/", categoryController.getAllCategories);

// Get only main categories
router.get("/main", categoryController.getMainCategories);

// Get sub categories
router.get("/sub/:id", categoryController.getSubCategories);


// ======================================
// ADMIN ROUTES
// ======================================

// Category count
router.get(
  "/count",
  protect,
  restrict("admin", "superAdmin"),
  categoryController.getCategoryCount
);

// Category sales
router.get(
  "/getCategorySale",
  protect,
  restrict("admin", "superAdmin"),
  categoryController.getCategorySales
);

// Add category
router.post(
  "/addCategory",
  protect,
  restrict("admin", "superAdmin"),
  upload.single("thumbnail"),
  categoryController.createCategory
);

// Update category
router.patch(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  upload.single("thumbnail"),
  categoryController.updateCategory
);

// Delete category
router.delete(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  categoryController.deleteCategory
);


// ======================================
// ⚠️ KEEP THIS LAST
// ======================================

// Get single category (must be last)
router.get("/:id", categoryController.getCategory);

module.exports = router;