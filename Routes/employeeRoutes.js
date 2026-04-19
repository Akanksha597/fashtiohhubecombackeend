const express = require("express");
const employeeController = require("../Controller/employeeController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");
const upload = require("../Middleware/upload"); // Import your upload middleware

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    restrict("admin", "superAdmin"),
    employeeController.getAllEmployees
  ) // Get all employees
  .post(
    protect,
    restrict("admin", "superAdmin"),
    upload.single("image"), // Only allow one image file upload
    employeeController.createEmployee
  ); // Create a new employee

router
  .route("/:id")
  .get(
    protect,
    restrict("admin", "superAdmin"),
    employeeController.getEmployee
  ) // Get employee by ID
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    upload.single("image"), // Allow updating image file
    employeeController.updateEmployee
  ) // Update employee by ID
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    employeeController.deleteEmployee
  ); // Delete employee by ID

module.exports = router;
