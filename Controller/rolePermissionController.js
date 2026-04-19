const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const RolesPermissions = require("../Models/rolesPermissionsModel");

// Create a new role with permissions
exports.createRole = asyncErrorHandler(async (req, res, next) => {
  const { roleData } = req.body;
  const { role, permissions } = roleData;
  if (!permissions) {
    return next(new CustomError("Permissions are required!", 400));
  }
  if (!role) {
    return next(new CustomError("Role is required!", 400));
  }
  console.log("this data is resived ",roleData);

  console.log("this is role ",role , "\n" , permissions);
  const newRole = await RolesPermissions.create({ role, permissions });

  res.status(201).json({
    status: "success",
    data: newRole,
  });
});

// Get all roles and permissions
exports.getAllRoles = asyncErrorHandler(async (req, res, next) => {
  const roles = await RolesPermissions.find();

  res.status(200).json({
    status: "success",
    data: roles,
  });
});

// Get a single role by ID
exports.getRoleById = asyncErrorHandler(async (req, res, next) => {
  const role = await RolesPermissions.findById(req.params.id);

  if (!role) {
    return next(new CustomError("Role not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: role,
  });
});

// Update role and permissions
exports.updateRole = asyncErrorHandler(async (req, res, next) => {
  const { role, permissions } = req.body;

  const updatedRole = await RolesPermissions.findByIdAndUpdate(
    req.params.id,
    { role, permissions },
    { new: true, runValidators: true }
  );

  if (!updatedRole) {
    return next(new CustomError("Role not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedRole,
  });
});

// Delete a role
exports.deleteRole = asyncErrorHandler(async (req, res, next) => {
  const deletedRole = await RolesPermissions.findByIdAndDelete(req.params.id);

  if (!deletedRole) {
    return next(new CustomError("Role not found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Role deleted successfully",
  });
});
