const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      walletBalance: user.walletBalance,
      palmRegistered: user.palmRegistered,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

module.exports = {
  getProfile,
};