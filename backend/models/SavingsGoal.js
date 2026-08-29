const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
