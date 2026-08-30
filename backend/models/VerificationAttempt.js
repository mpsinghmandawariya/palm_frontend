const mongoose = require("mongoose");

const verificationAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // May be null for failed 1:N POS attempts where no user was confirmed
    },

    context: {
      type: String,
      enum: ["REGISTER", "VERIFY_1_1", "IDENTIFY_1_N"],
      required: true,
    },

    outcome: {
      type: String,
      enum: ["SUCCESS", "NO_PALM_DETECTED", "LOW_QUALITY", "NO_MATCH", "ERROR"],
      required: true,
    },

    score: {
      type: Number,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VerificationAttempt", verificationAttemptSchema);
