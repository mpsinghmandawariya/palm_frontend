const mongoose = require("mongoose");

const EMBEDDING_DIM = 1280;

const palmProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    embedding: {
      type: [Number],
      required: [true, "Biometric embedding array is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === EMBEDDING_DIM;
        },
        message: (props) =>
          `Biometric embedding must have exactly ${EMBEDDING_DIM} dimensions, received ${props.value ? props.value.length : 0}`,
      },
    },

    qualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    livenessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
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

const PalmProfile = mongoose.model("PalmProfile", palmProfileSchema);
PalmProfile.EMBEDDING_DIM = EMBEDDING_DIM;

module.exports = PalmProfile;