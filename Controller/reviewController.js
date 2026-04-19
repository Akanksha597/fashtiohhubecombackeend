const Review = require("../Models/reviewModel")
const Order = require("../Models/orderModel");
const asyncErrorHandler = require("../Utils/errorHandler");
// Create a new review
const createReview = async (req, res) => {
  const { user, productId, rating, description } = req.body;

  try {
    // Validate that user and productId are provided
    if (!user || !productId || !rating || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create and save the review
    const newReview = new Review({
      user,
      productId,
      rating,
      description,
    });
    await newReview.save();

    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating review" });
  }
};

// Get all reviews for a product
const getReviewsForProduct = async (req, res) => {
  const { id: productId } = req.params; // Use correct parameter extraction

  try {
    const reviews = await Review.find({ productId }).populate("user", "name");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews for product" });
  }
};

// Get all reviews by a user
const getReviewsByUser = async (req, res) => {
  const { id: userId } = req.params; // Use correct parameter extraction

  try {
    const reviews = await Review.find({ user: userId }).populate(
      "productId",
      "name"
    );
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews by user" });
  }
};

// Update review status (approve/reject)
const updateReviewStatus = async (req, res) => {
  const { reviewId, status } = req.body;

  // Validate status value
  if (!["approved", "pending", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    review.status = status;
    await review.save();

    res.status(200).json({
      message: `Review status updated to ${status}`,
      review,
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating review status" });
  }
};

// Update review content (rating, description)
const updateReviewContent = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, description } = req.body;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.description = description || review.description;

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating review" });
  }
};


const deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await review.remove();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting review" });
  }
};


 const checkCustomerProduct = asyncErrorHandler(async (req, res, next) => {
  const { productId, email, mobileNumber } = req.query;

  if (!productId || (!email && !mobileNumber)) {
    return res.status(400).json({
      status: "fail",
      message: "Product ID and either email or mobile number are required",
    });
  }

  // Find an order that contains the product and matches the customer details
  const order = await Order.findOne({
    "dbCart.productId": productId,
    $or: [
      { customerEmail: email || null },
      { customerPhoneNumber: mobileNumber || null },
    ],
  });

  res.status(200).json({
    status: "success",
    hasProduct: !!order, // true if order exists, false otherwise
  });
});


module.exports = {
  createReview,
  getReviewsForProduct,
  getReviewsByUser,
  updateReviewStatus,
  updateReviewContent,
  deleteReview,
  checkCustomerProduct,
};
