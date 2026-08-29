const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["CASHBACK", "POINTS", "SCRATCH_CARD", "COUPON"], default: "SCRATCH_CARD" },
    value: { type: Number, default: 0 },
    isRevealed: { type: Boolean, default: false },
    code: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);
