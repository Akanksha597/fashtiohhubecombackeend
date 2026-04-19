const express = require("express");
const rolesPermissionsController = require("../Controller/rolePermissionController");
const { protect } = require("../Middleware/protect");
const { restrict } = require("../Middleware/restrict");

const router = express.Router();

// Get all roles and create a new role
router
  .route("/")
  .get(rolesPermissionsController.getAllRoles)
  .post(
    protect,
    restrict("admin", "superAdmin"),
    rolesPermissionsController.createRole
  );

// Get, update, and delete a specific role by ID
router
  .route("/:id")
  .get(rolesPermissionsController.getRoleById)
  .patch(
    protect,
    restrict("admin", "superAdmin"),
    rolesPermissionsController.updateRole
  )
  .delete(
    protect,
    restrict("admin", "superAdmin"),
    rolesPermissionsController.deleteRole
  );

module.exports = router;
