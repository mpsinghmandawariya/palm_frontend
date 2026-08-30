const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.userId).select("role name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Role check
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Administrator privileges required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin Authorization Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

module.exports = adminMiddleware;
