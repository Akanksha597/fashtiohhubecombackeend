const CustomError = require("../Utils/customError");

exports.restrict = (...role) => {
    return (req, res, next) => {

      if (!role.includes(req.user.role)) {
        const error = new CustomError(
          "You do not have permission to perform this action",
          403
        );
        next(error);
        console.log(error);
        
      }
      next();
    };
  };
  