const express = require("express");
const { protect } = require("../Middleware/protect");
const offerController = require("../Controller/offerController");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();

router.route("/").get(offerController.getAllOffers);
router
  .route("/addOffer")
  .post(protect, restrict("admin", "superAdmin"), offerController.createOffer);
router
  .route("/:id")
  .get(offerController.getOffer)
  .patch(protect, restrict("admin", "superAdmin"), offerController.updateOffer)
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    offerController.deleteOffer
  );

module.exports = router;
