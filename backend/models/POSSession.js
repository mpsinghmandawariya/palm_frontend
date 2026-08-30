const mongoose = require("mongoose");

const posSessionSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be at least ₹0.01"],
    },

    status: {
      type: String,
      enum: ["AWAITING_SCAN", "IDENTIFIED", "AUTHORIZED", "CANCELLED", "EXPIRED"],
      default: "AWAITING_SCAN",
      required: true,
    },

    identifiedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    matchScore: {
      type: Number,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 90 * 1000), // 90 seconds
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index for automatic MongoDB cleanup of stale sessions
posSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("POSSession", posSessionSchema);
