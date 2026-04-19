const express = require("express");
const unitController = require("../Controller/unitController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();

router
  .route("/")
  .get(unitController.getAllUnits) 
  .post(
    protect,
    restrict("admin", "superAdmin"),
    unitController.createUnit
  ); 

router
  .route("/:id")
  .get(unitController.getUnit)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    unitController.updateUnit
  ) 
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    unitController.deleteUnit
  );

module.exports = router;
