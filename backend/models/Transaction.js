const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: () => `PALM-TX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      index: true,
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      default: null,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    recipientPhone: {
      type: String,
      default: null,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Transaction amount must be positive"],
    },

    type: {
      type: String,
      enum: ["PALM_PAYMENT", "WALLET_TOPUP", "POS_PAYMENT", "TRANSFER", "RECEIVED"],
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
      default: "SUCCESS",
    },

    authMethod: {
      type: String,
      enum: ["PALM", "PIN", null],
      default: null,
    },

    matchScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);