const express = require("express");
const orderController = require("../Controller/orderController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();

router
  .route("/")
  .get(protect,  orderController.getAllOrders);
  router
  .route("/stats")
  .get(protect, restrict("admin", "superAdmin"), orderController.getOrderStats);

  router
  .route("/refundRequest")
  .get(protect, restrict("admin", "superAdmin"), orderController.getCancelledOrRefundOrders);

router
  .route("/createOrder")
  .post(protect, orderController.createOrder);
router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(protect, orderController.updateOrder)
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    orderController.deleteOrder
  );
  


module.exports = router;
