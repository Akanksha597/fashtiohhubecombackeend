const User = require("../Models/userModel");
const CustomError = require("../Utils/customError");
const asyncErrorHandler = require("../Utils/errorHandler");
const authController = require("./authController");

// Function to count users by role
const countRoleWiseUsers = async (queryObj) => {
  return await User.aggregate([
    { $match: queryObj }, // Apply filters
    { $group: { _id: "$role", count: { $sum: 1 } } }, // Group by role and count
    { $project: { role: "$_id", count: 1, _id: 0 } }, // Format the output
  ]);
};

exports.getUser = asyncErrorHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id);
  res.status(200).json({ message: "Success", user });
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {

  const user = await User.findById(req.user._id).select("+password");
  
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(
      new CustomError("The current password you provided is wrong", 401)
    );
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  authController.createSendResponse(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
 
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError(
        "You cannot update your password using this endpoint",
        400
      )
    );
  }

  try {
    const { email, name, ...updateFields } = req.body;
    if (!email || !name) {
      return next(new CustomError("Both email and name are required to find the user.", 400));
    }
    delete updateFields.password;
    delete updateFields.confirmPassword;
    if (Object.keys(updateFields).length === 0) {
      return next(new CustomError("No valid fields provided for update.", 400));
    }
    const updatedUser = await User.findOneAndUpdate(
      { email, name }, 
      updateFields,    
      {
        runValidators: true,
        new: true,          
      }
    );
    if (!updatedUser) {
      return next(new CustomError("User not found. Please try again.", 404));
    }
    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error); 
  }
});


exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const { role, status, keyword, page = 1, limit = 10 } = req.query;
  const queryObj = {};

  // Filters
  if (role) queryObj.role = role;
  if (status) queryObj.active = status === "active";
  if (keyword) {
    if (!isNaN(keyword)) {
      queryObj.mobile = keyword; // Numeric keyword for mobile
    } else {
      queryObj.$or = [
        { name: { $regex: `^${keyword}$`, $options: "i" } },
        { email: { $regex: `^${keyword}$`, $options: "i" } },
      ];
    }
  }

  const skip = (page - 1) * limit; // Pagination
  const users = await User.find(queryObj).skip(skip).limit(Number(limit)); // Fetch users

  const totalDocuments = await User.countDocuments(queryObj); // Total users count
  const totalPages = Math.ceil(totalDocuments / limit); // Total pages

  // Get role-wise user count
  const roleWiseCount = await countRoleWiseUsers(queryObj);

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
    pagination: {
      totalDocuments,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
    },
    roleWiseCount, // Include role-wise count
  });
});
