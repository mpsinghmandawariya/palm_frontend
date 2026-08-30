const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing or malformed", 401, "UNAUTHORIZED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      return next(new AppError("Server configuration error: JWT_SECRET missing", 500, "CONFIG_ERROR"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists", 401, "USER_NOT_FOUND"));
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please sign in again.", 401, "TOKEN_EXPIRED"));
    }
    return next(new AppError("Invalid authentication token", 401, "INVALID_TOKEN"));
  }
};

module.exports = authMiddleware;