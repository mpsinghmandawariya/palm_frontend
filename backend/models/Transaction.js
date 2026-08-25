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
      enum: ["PALM_PAYMENT"],
      required: true,
    },

    status: {
      type: String,
      enum: ["COMPLETED", "FAILED"],
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

module.exports =
  mongoose.model(
    "Transaction",
    transactionSchema
  );