const express = require("express");
const productController = require("../Controller/productController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload");

const router = express.Router();


// ======================================
// PUBLIC ROUTES
// ======================================

// Get all products
router.get("/", productController.getAllProducts);

// Product sales
router.get("/productSale", productController.getProductSales);

// Product offers
router.get("/productOffer", productController.getProductsByOffer);


// ======================================
// ADMIN ROUTES
// ======================================

// Product count
router.get(
  "/count",
  protect,
  restrict("admin", "superAdmin"),
  productController.getProductCount
);

// Add product
router.post(
  "/addProduct",
  protect,
  restrict("admin", "superAdmin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  productController.createProduct
);

// Update & Delete product
router.patch(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  productController.updateProduct
);

router.delete(
  "/:id",
  protect,
  restrict("admin", "superAdmin"),
  productController.deleteProduct
);


// ======================================
// ⚠️ KEEP LAST (VERY IMPORTANT)
// ======================================

// Get single product
router.get("/:id", productController.getProduct);


module.exports = router;