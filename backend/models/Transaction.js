const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    type: {
      type: String,
      enum: ["PALM_PAYMENT", "TRANSFER", "WALLET_TOPUP", "BILL_PAYMENT"],
      default: "PALM_PAYMENT",
      required: true,
    },

    recipientName: {
      type: String,
      default: "Merchant / Palm Payee",
    },

    recipientPhone: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Payment",
    },

    status: {
      type: String,
      enum: ["COMPLETED", "FAILED", "PENDING"],
      default: "COMPLETED",
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);