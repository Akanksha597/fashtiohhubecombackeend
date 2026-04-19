const express = require("express");
const { protect } = require("../Middleware/protect");
const campaignController = require("../Controller/campaignController");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();

router.route("/").get(campaignController.getAllCampaigns);
router
  .route("/addCampaign")
  .post(
    protect,
    restrict("admin", "superAdmin"),
    campaignController.createCampaign
  );
router
  .route("/:id")
  .get(campaignController.getAllCampaigns)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    campaignController.updateCampaign
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    campaignController.deleteCampaign
  );

module.exports = router;
