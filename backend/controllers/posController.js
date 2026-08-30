const mongoose = require("mongoose");
const POSSession = require("../models/POSSession");
const Merchant = require("../models/Merchant");
const User = require("../models/User");
const PalmProfile = require("../models/PalmProfile");
const Transaction = require("../models/Transaction");
const VerificationAttempt = require("../models/VerificationAttempt");
const mlService = require("../services/mlService");
const walletService = require("../services/walletService");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const IDENTIFY_THRESHOLD = Number(process.env.MATCH_THRESHOLD_IDENTIFY) || 0.78;

const createSession = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numAmount = Number(amount);

  // Find or create merchant profile for the owner
  let merchant = await Merchant.findOne({ ownerUserId: req.userId });
  if (!merchant) {
    merchant = await Merchant.create({
      ownerUserId: req.userId,
      businessName: `${req.user.name}'s Store`,
      walletBalance: 0,
    });
  }

  const session = await POSSession.create({
    merchantId: merchant._id,
    amount: numAmount,
    status: "AWAITING_SCAN",
    expiresAt: new Date(Date.now() + 90 * 1000), // 90-second timeout
  });

  res.status(201).json({
    success: true,
    sessionId: session._id,
    status: session.status,
    amount: session.amount,
    expiresAt: session.expiresAt,
  });
});

const identifyPalm = asyncHandler(async (req, res) => {
  const { sessionId, image } = req.body;
  const requestId = req.requestId;

  const session = await POSSession.findById(sessionId);
  if (!session) {
    throw new AppError("POS Session not found", 404, "SESSION_NOT_FOUND");
  }

  if (session.status !== "AWAITING_SCAN") {
    throw new AppError("POS session is not in awaiting scan status", 400, "INVALID_SESSION_STATUS");
  }

  if (new Date() > new Date(session.expiresAt)) {
    session.status = "EXPIRED";
    await session.save();
    throw new AppError("POS session has expired. Please initiate a new scan.", 410, "SESSION_EXPIRED");
  }

  // Load candidate palm embeddings from database
  const profiles = await PalmProfile.find({ embedding: { $exists: true, $size: 1280 } })
    .populate("userId", "name email phone walletBalance")
    .lean();

  if (!profiles || profiles.length === 0) {
    await VerificationAttempt.create({
      context: "IDENTIFY_1_N",
      outcome: "NO_MATCH",
    });
    throw new AppError("No registered palm profiles available for comparison", 404, "NO_MATCH_FOUND");
  }

  const candidates = profiles
    .filter((p) => p.userId && p.embedding)
    .map((p) => ({
      id: p.userId._id.toString(),
      embedding: p.embedding,
    }));

  let matchResult;
  try {
    matchResult = await mlService.identify(image, candidates, IDENTIFY_THRESHOLD, requestId);
  } catch (err) {
    await VerificationAttempt.create({
      context: "IDENTIFY_1_N",
      outcome: "ERROR",
    });
    throw err;
  }

  if (!matchResult.match) {
    await VerificationAttempt.create({
      context: "IDENTIFY_1_N",
      outcome: "NO_MATCH",
      score: matchResult.best_score || null,
    });
    throw new AppError("No matching registered customer found for this palm scan", 404, "NO_MATCH_FOUND");
  }

  const matchedUser = profiles.find((p) => p.userId._id.toString() === matchResult.match.id)?.userId;
  if (!matchedUser) {
    throw new AppError("Identified customer record could not be loaded", 404, "CUSTOMER_NOT_FOUND");
  }

  const matchPercentage = Math.round(matchResult.match.score * 100);

  session.status = "IDENTIFIED";
  session.identifiedUserId = matchedUser._id;
  session.matchScore = matchPercentage;
  await session.save();

  await VerificationAttempt.create({
    userId: matchedUser._id,
    context: "IDENTIFY_1_N",
    outcome: "SUCCESS",
    score: matchResult.match.score,
  });

  res.status(200).json({
    success: true,
    customerId: matchedUser._id,
    customerName: matchedUser.name,
    matchScore: matchPercentage,
  });
});

const authorizePayment = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  const session = await POSSession.findById(sessionId);
  if (!session) {
    throw new AppError("POS Session not found", 404, "SESSION_NOT_FOUND");
  }

  if (session.status !== "IDENTIFIED") {
    throw new AppError("Customer has not been identified on this POS session", 409, "SESSION_NOT_IDENTIFIED");
  }

  if (new Date() > new Date(session.expiresAt)) {
    session.status = "EXPIRED";
    await session.save();
    throw new AppError("POS session has expired", 410, "SESSION_EXPIRED");
  }

  const merchant = await Merchant.findById(session.merchantId);
  if (!merchant) {
    throw new AppError("Merchant account not found", 404, "MERCHANT_NOT_FOUND");
  }

  // Check customer balance and debit atomically
  let remainingBalance;
  try {
    remainingBalance = await walletService.debit(session.identifiedUserId, session.amount);
    await walletService.creditMerchant(merchant._id, session.amount);
  } catch (err) {
    if (err.code === "INSUFFICIENT_BALANCE") {
      session.status = "CANCELLED";
      await session.save();
    }
    throw err;
  }

  const transaction = await Transaction.create({
    payerId: session.identifiedUserId,
    merchantId: merchant._id,
    recipientName: merchant.businessName,
    amount: session.amount,
    type: "POS_PAYMENT",
    status: "SUCCESS",
    authMethod: "PALM",
    matchScore: session.matchScore,
  });

  session.status = "AUTHORIZED";
  await session.save();

  res.status(200).json({
    success: true,
    transactionId: transaction._id,
    amount: session.amount,
    remainingBalance,
    matchScore: session.matchScore,
  });
});

module.exports = {
  createSession,
  identifyPalm,
  authorizePayment,
};
