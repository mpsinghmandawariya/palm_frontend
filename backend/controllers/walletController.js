const User = require("../models/User");
const Transaction = require("../models/Transaction");
const walletService = require("../services/walletService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    balance: user.walletBalance,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      palmRegistered: user.palmRegistered,
      role: user.role,
    },
  });
});

const topUp = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0) {
    throw new AppError("Top-up amount must be greater than zero", 400, "VALIDATION_ERROR");
  }

  const newBalance = await walletService.credit(req.userId, numAmount);

  await Transaction.create({
    payerId: req.userId,
    recipientName: "Wallet Balance Top-Up",
    amount: numAmount,
    type: "WALLET_TOPUP",
    status: "SUCCESS",
    authMethod: null,
  });

  res.status(200).json({
    success: true,
    balance: newBalance,
  });
});

module.exports = {
  getWallet,
  topUp,
};