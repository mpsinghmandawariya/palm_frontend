const mongoose = require("mongoose");

const billerSchema = new mongoose.Schema(
  {
    billerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Mobile", "Electricity", "Water", "DTH", "Broadband", "FASTag", "Rent"],
      required: true,
    },
    icon: { type: String, default: "⚡" },
    sampleConsumerNumber: { type: String, default: "1002938491" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Biller", billerSchema);
