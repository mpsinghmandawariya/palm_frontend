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
      avatar: user.avatar || "",
      walletBalance: user.walletBalance,
      palmRegistered: user.palmRegistered,
      consentGivenAt: user.consentGivenAt,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const updates = {};
  if (name && name.trim()) {
    updates.name = name.trim();
  }
  if (phone && phone.trim()) {
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      // Check if phone already taken by another user
      const existing = await User.findOne({ phone: cleanPhone, _id: { $ne: req.userId } });
      if (existing) {
        throw new AppError("This mobile number is already in use by another account", 409, "PHONE_ALREADY_EXISTS");
      }
      updates.phone = cleanPhone;
    }
  }
  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || "",
      walletBalance: user.walletBalance,
      palmRegistered: user.palmRegistered,
      role: user.role,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
};