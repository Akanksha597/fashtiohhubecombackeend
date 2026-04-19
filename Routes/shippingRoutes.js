const express = require("express");
const shippingController = require("../Controller/shippingController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");

const router = express.Router();

router.route("/").get(shippingController.getAllShipping);

router
  .route("/addShipping")
  .post(
    protect,
    restrict("admin", "superAdmin"),
    shippingController.createShipping
  );

// Routes for specific shipping entry operations (get, update, delete)
router
  .route("/:id")
  .get(shippingController.getShipping)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    shippingController.updateShipping
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    shippingController.deleteShipping
  );

module.exports = router;
