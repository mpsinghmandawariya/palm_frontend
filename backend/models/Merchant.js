const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    category: { type: String, default: "Retail" },
    merchantQrCode: { type: String, required: true },
    totalSalesVolume: { type: Number, default: 0 },
    settlementAccount: { type: String, default: "HDFC-****-9821" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchant", merchantSchema);
