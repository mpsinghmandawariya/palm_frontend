const mongoose = require("mongoose");

const palmProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    palmImage: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "pending"],
      default: "registered",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PalmProfile",
  palmProfileSchema
);