const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "", // Base64 image data URL or avatar URL
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return by default
    },

    pin: {
      type: String,
      required: true,
      select: false, // Never return by default
    },

    walletBalance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },

    palmRegistered: {
      type: Boolean,
      default: false,
    },

    consentGivenAt: {
      type: Date,
      default: null, // BIPA & GDPR Article 9 explicit biometric consent timestamp
    },

    role: {
      type: String,
      enum: ["user", "merchant"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);