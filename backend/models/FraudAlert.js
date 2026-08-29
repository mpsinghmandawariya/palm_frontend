const mongoose = require("mongoose");

const fraudAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    reason: { type: String, required: true },
    actionTaken: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FraudAlert", fraudAlertSchema);
