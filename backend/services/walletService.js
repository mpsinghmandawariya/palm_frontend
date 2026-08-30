const mongoose = require("mongoose");
const User = require("../models/User");
const Merchant = require("../models/Merchant");
const AppError = require("../utils/AppError");

const walletService = {
  /**
   * Atomically checks balance and debits wallet in a single operation.
   * Race condition proof via MongoDB's { $gte: amount } query filter.
   */
  async debit(userId, amount, options = {}) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new AppError("Debit amount must be greater than zero", 400, "INVALID_AMOUNT");
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: numAmount } },
      { $inc: { walletBalance: -numAmount } },
      { new: true, ...options }
    );

    if (!updated) {
      throw new AppError("Insufficient balance to complete transaction", 400, "INSUFFICIENT_BALANCE");
    }

    return updated.walletBalance;
  },

  /**
   * Atomically credits wallet funds.
   */
  async credit(userId, amount, options = {}) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new AppError("Credit amount must be greater than zero", 400, "INVALID_AMOUNT");
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { walletBalance: numAmount } },
      { new: true, ...options }
    );

    if (!updated) {
      throw new AppError("User wallet not found", 404, "USER_NOT_FOUND");
    }

    return updated.walletBalance;
  },

  /**
   * Atomically credits a merchant's receiving wallet balance.
   */
  async creditMerchant(merchantId, amount, options = {}) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new AppError("Credit amount must be greater than zero", 400, "INVALID_AMOUNT");
    }

    const updated = await Merchant.findOneAndUpdate(
      { _id: merchantId },
      { $inc: { walletBalance: numAmount } },
      { new: true, ...options }
    );

    if (!updated) {
      throw new AppError("Merchant account not found", 404, "MERCHANT_NOT_FOUND");
    }

    return updated.walletBalance;
  },
};

module.exports = walletService;
