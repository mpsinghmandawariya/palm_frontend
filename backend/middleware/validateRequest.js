const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    const firstMsg = errorDetails[0]?.message || "Validation failed";
    return next(new AppError(firstMsg, 400, "VALIDATION_ERROR", errorDetails));
  }
  next();
};

module.exports = validateRequest;
