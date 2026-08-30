const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Merchant wallet balance cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Merchant", merchantSchema);
