const express = require("express");
const productController = require("../Controller/productController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();
const upload = require("../Middleware/upload");
router.route("/").get(productController.getAllProducts);

router
  .route("/productSale")
  .get(
    productController.getProductSales
  );
  router
  .route("/productOffer")
  .get(
    productController.getProductsByOffer
  );

router
  .route("/count")
  .get(
    protect,
    restrict("admin", "superAdmin"),
    productController.getProductCount
  );
router.route("/addProduct").post(
  protect,
  upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 }, // ✅ FIX
]),
  restrict("admin", "superAdmin"),
  productController.createProduct
);
router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    protect,
   upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 }, // ✅ FIX
]),
    restrict("admin", "superAdmin"),
    productController.updateProduct
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    productController.deleteProduct
  );
router
  .route("/count")
  .get(
    protect,
    restrict("admin", "superAdmin"),
    productController.getProductCount
  );

module.exports = router;
