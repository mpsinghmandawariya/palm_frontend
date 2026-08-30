const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PalmProfile = require("../models/PalmProfile");
const Transaction = require("../models/Transaction");
const VerificationAttempt = require("../models/VerificationAttempt");
const mlService = require("../services/mlService");
const walletService = require("../services/walletService");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const MATCH_THRESHOLD = Number(process.env.MATCH_THRESHOLD_VERIFY) || 0.65;

const lookupPhone = asyncHandler(async (req, res) => {
  const { phone } = req.params;
  const cleanPhone = (phone || "").replace(/\D/g, "");

  if (cleanPhone.length !== 10) {
    throw new AppError("Invalid mobile number format", 400, "VALIDATION_ERROR");
  }

  const user = await User.findOne({ phone: cleanPhone });
  if (!user) {
    return res.status(200).json({
      success: false,
      message: "No user found with this mobile number",
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      palmRegistered: user.palmRegistered,
    },
  });
});

const pay = asyncHandler(async (req, res) => {
  const { amount, recipientName, recipientPhone, image, pin } = req.body;
  const requestId = req.requestId;
  const numAmount = Number(amount);

  // 1. Ensure at least one authentication factor is present
  if (!image && !pin) {
    throw new AppError("Either a palm scan image or security PIN is required", 400, "VALIDATION_ERROR");
  }

  // 2. Fetch User secrets
  const user = await User.findById(req.userId).select("+pin");
  if (!user) {
    throw new AppError("User account not found", 404, "USER_NOT_FOUND");
  }

  // 3. Evaluate PIN if provided
  let isPinVerified = false;
  if (pin) {
    const isMatch = await bcrypt.compare(String(pin), user.pin);
    if (!isMatch) {
      await VerificationAttempt.create({
        userId: req.userId,
        context: "VERIFY_1_1",
        outcome: "NO_MATCH",
      });
      throw new AppError("Incorrect security PIN. Please try again.", 401, "INCORRECT_PIN");
    }
    isPinVerified = true;
  }

  // 4. Evaluate Palm Biometrics if image provided
  let mlVerified = false;
  let matchScore = null;

  if (image && !isPinVerified) {
    const palmProfile = await PalmProfile.findOne({ userId: req.userId });

    if (palmProfile && palmProfile.embedding && palmProfile.embedding.length === 1280) {
      try {
        const mlResult = await mlService.verify(image, palmProfile.embedding, requestId);
        matchScore = Math.round((mlResult.score || 0) * 100);

        if (mlResult.score >= MATCH_THRESHOLD) {
          mlVerified = true;
        }
      } catch (err) {
        // If ML is down, log error attempt and let it fall through to PIN_CHALLENGE
        await VerificationAttempt.create({
          userId: req.userId,
          context: "VERIFY_1_1",
          outcome: "ERROR",
        });

        // If no PIN was supplied, bubble up the ML service unavailable error
        if (!pin) {
          throw err;
        }
      }
    }
  }

  // 5. Verification Gate: If neither factor cleared, trigger PIN Challenge
  if (!mlVerified && !isPinVerified) {
    await VerificationAttempt.create({
      userId: req.userId,
      context: "VERIFY_1_1",
      outcome: "NO_MATCH",
      score: matchScore ? matchScore / 100 : null,
    });
    throw new AppError("Biometric verification failed. Please enter your 4-digit PIN.", 401, "PIN_CHALLENGE");
  }

  // 6. Check for Recipient by Mobile Number (P2P Transfer)
  const cleanPhone = (recipientPhone || recipientName || "").replace(/\D/g, "");
  let recipientUser = null;
  if (cleanPhone.length === 10) {
    recipientUser = await User.findOne({ phone: cleanPhone });
  }

  // 7. Atomic Balance Check and Deduction (Zero Race Window)
  const newBalance = await walletService.debit(req.userId, numAmount);

  // 8. If recipient is an enrolled user, credit their balance atomically
  let txType = "PALM_PAYMENT";
  let targetName = (recipientName || "Recipient").trim();

  if (recipientUser) {
    txType = "TRANSFER";
    targetName = `${recipientUser.name} (${recipientUser.phone})`;
    await walletService.credit(recipientUser._id, numAmount);

    // Record incoming credit transaction for recipient
    await Transaction.create({
      payerId: recipientUser._id,
      recipientUserId: req.userId,
      recipientName: `Received from ${user.name} (${user.phone})`,
      recipientPhone: user.phone,
      amount: numAmount,
      type: "RECEIVED",
      status: "SUCCESS",
      authMethod: null,
    });
  }

  // 9. Record Outgoing Transaction
  const transaction = await Transaction.create({
    payerId: req.userId,
    recipientUserId: recipientUser ? recipientUser._id : null,
    recipientName: targetName,
    recipientPhone: cleanPhone.length === 10 ? cleanPhone : null,
    amount: numAmount,
    type: txType,
    status: "SUCCESS",
    authMethod: mlVerified ? "PALM" : "PIN",
    matchScore: mlVerified ? matchScore : null,
  });

  // 10. Record Successful Audit Log
  await VerificationAttempt.create({
    userId: req.userId,
    context: "VERIFY_1_1",
    outcome: "SUCCESS",
    score: matchScore ? matchScore / 100 : 1.0,
  });

  res.status(200).json({
    success: true,
    payment: {
      transactionId: transaction.transactionId || transaction._id,
      amount: numAmount,
      recipientName: transaction.recipientName,
      matchScore: transaction.matchScore,
      authMethod: transaction.authMethod,
      newBalance,
      createdAt: transaction.createdAt,
    },
  });
});

module.exports = {
  pay,
  lookupPhone,
};