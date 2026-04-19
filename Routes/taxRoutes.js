const express = require("express");
const taxController = require("../Controller/taxController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const router = express.Router();

router
  .route("/")
  .get(taxController.getAllTaxes) // Public route to get all taxes
  .post(
    protect,
    restrict("admin", "superAdmin"),
    taxController.createTax
  ); 

router
  .route("/:id")
  .get(taxController.getTax) 
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    taxController.updateTax
  ) 
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    taxController.deleteTax
  );

module.exports = router;
