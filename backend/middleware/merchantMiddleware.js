const AppError = require("../utils/AppError");

const merchantMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "merchant") {
    return next(new AppError("Merchant privileges are required to access this endpoint", 403, "MERCHANT_ROLE_REQUIRED"));
  }
  next();
};

module.exports = merchantMiddleware;
