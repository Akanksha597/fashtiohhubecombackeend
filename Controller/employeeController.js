const Employee = require("../Models/employeeModel");
const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");

// Create a new employee
exports.createEmployee = asyncErrorHandler(async (req, res, next) => {
  const { name, email, role, phone, password } = req.body;
  const image = req.file ? req.file.path : null;

  const employeeData = { name, email, role, phone, password, image };
  const employee = await Employee.create(employeeData);

  res.status(201).json({
    status: "success",
    data: { employee },
  });
});

// Get a single employee by ID
exports.getEmployee = asyncErrorHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(new CustomError("Employee not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

// Get all employees
exports.getAllEmployees = asyncErrorHandler(async (req, res, next) => {
  const employees = await Employee.find();
  res.status(200).json({
    status: "success",
    results: employees.length,
    data: { employees },
  });
});

// Update an employee by ID
exports.updateEmployee = asyncErrorHandler(async (req, res, next) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.image = req.file.path;
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedEmployee) {
    return next(new CustomError("Employee not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { employee: updatedEmployee },
  });
});

// Delete an employee by ID
exports.deleteEmployee = asyncErrorHandler(async (req, res, next) => {
  const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
  if (!deletedEmployee) {
    return next(new CustomError("Employee not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
