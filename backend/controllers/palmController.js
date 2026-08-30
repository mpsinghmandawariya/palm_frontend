const PalmProfile = require("../models/PalmProfile");
const User = require("../models/User");
const VerificationAttempt = require("../models/VerificationAttempt");
const mlService = require("../services/mlService");
const asyncHandler = require("../utils/asyncHandler");

const recordConsent = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { consentGivenAt: new Date() },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Biometric consent recorded successfully",
    consentGivenAt: user.consentGivenAt,
  });
});

const registerPalm = asyncHandler(async (req, res) => {
  const { image } = req.body;
  const requestId = req.requestId;

  // Step 1: Call ML Service (Zero raw image persistence - processed strictly in memory)
  let mlResult;
  try {
    mlResult = await mlService.register(image, requestId);
  } catch (err) {
    await VerificationAttempt.create({
      userId: req.userId,
      context: "REGISTER",
      outcome: err.code === "PALM_NOT_DETECTED" ? "NO_PALM_DETECTED" : err.code === "LOW_QUALITY" ? "LOW_QUALITY" : "ERROR",
    });
    throw err;
  }

  // Step 2: Upsert PalmProfile (Privacy: Storing ONLY the 1280-d float vector)
  await PalmProfile.findOneAndUpdate(
    { userId: req.userId },
    {
      userId: req.userId,
      embedding: mlResult.embedding,
      qualityScore: mlResult.qualityScore,
      livenessScore: mlResult.livenessScore,
      registeredAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  // Step 3: Update User status and record consent timestamp if not already recorded
  await User.findByIdAndUpdate(req.userId, {
    palmRegistered: true,
    $setOnInsert: { consentGivenAt: new Date() },
  });

  // Step 4: Audit Verification Attempt
  await VerificationAttempt.create({
    userId: req.userId,
    context: "REGISTER",
    outcome: "SUCCESS",
    score: mlResult.qualityScore,
  });

  res.status(201).json({
    success: true,
    qualityScore: mlResult.qualityScore,
    livenessScore: mlResult.livenessScore,
  });
});

const getPalmStatus = asyncHandler(async (req, res) => {
  const profile = await PalmProfile.findOne({ userId: req.userId });
  const user = await User.findById(req.userId);

  if (!profile) {
    return res.status(200).json({
      success: true,
      registered: false,
      consentGivenAt: user?.consentGivenAt || null,
    });
  }

  res.status(200).json({
    success: true,
    registered: true,
    qualityScore: profile.qualityScore,
    livenessScore: profile.livenessScore,
    registeredAt: profile.registeredAt,
    updatedAt: profile.updatedAt,
    consentGivenAt: user?.consentGivenAt || null,
  });
});

const deletePalm = asyncHandler(async (req, res) => {
  // Idempotent: Permanently deletes the PalmProfile document
  await PalmProfile.findOneAndDelete({ userId: req.userId });
  await User.findByIdAndUpdate(req.userId, { palmRegistered: false });

  res.status(200).json({
    success: true,
    message: "Palm biometric template permanently deleted",
  });
});

module.exports = {
  recordConsent,
  registerPalm,
  getPalmStatus,
  deletePalm,
};