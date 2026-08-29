const mongoose = require("mongoose");

const autoPayMandateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"], default: "MONTHLY" },
    billerName: { type: String, required: true },
    nextPaymentDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "PAUSED", "CANCELLED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AutoPayMandate", autoPayMandateSchema);
