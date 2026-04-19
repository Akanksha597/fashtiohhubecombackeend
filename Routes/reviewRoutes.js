const express = require("express");
const reviewController = require('../Controller/reviewController'); 
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");

const router = express.Router();

// Get all reviews for a specific product
router.route("/product/:id").get( reviewController.getReviewsForProduct);


router.route("/create").post(protect, reviewController.createReview);


router.route("/user/:id").get(protect, reviewController.getReviewsByUser);

router.route("/managereview").get(protect, reviewController.checkCustomerProduct);

module.exports = router;
