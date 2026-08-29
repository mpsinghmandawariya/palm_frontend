const User = require("../models/User");
const PalmProfile = require("../models/PalmProfile");
const Transaction = require("../models/Transaction");
const FraudAlert = require("../models/FraudAlert");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const { evaluateTransactionRisk } = require("../services/riskEngine");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

function base64ToBlob(base64Data) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let mimeType = "image/jpeg";
  let buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], "base64");
  } else {
    buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), "base64");
  }
  return new Blob([buffer], { type: mimeType });
}

const generateTransactionId = () => {
  return "EP-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
};

const payWithPalm = async (req, res) => {
  try {
    const { amount, image, pin, recipientName, recipientPhone, category } = req.body;

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // PIN FALLBACK OPTION IF PROVIDED
    let isPinVerified = false;
    if (pin && pin.length === 4) {
      isPinVerified = await bcrypt.compare(pin, user.pin);
      if (!isPinVerified) {
        return res.status(401).json({
          success: false,
          message: "Incorrect 4-digit PIN",
        });
      }
    }

    let mlData = { similarity: 0, quality_score: 0.9, liveness_score: 0.95, verified: false };

    if (image) {
      const palmProfile = await PalmProfile.findOne({ userId: req.userId });
      if (palmProfile && palmProfile.embedding && palmProfile.embedding.length > 0) {
        const blob = base64ToBlob(image);
        const formData = new FormData();
        formData.append("file", blob, "verify_palm.jpg");
        formData.append("target_embedding", JSON.stringify(palmProfile.embedding));

        try {
          const mlResponse = await fetch(`${ML_SERVICE_URL}/verify`, {
            method: "POST",
            body: formData,
          });
          if (mlResponse.ok) {
            mlData = await mlResponse.json();
          }
        } catch (err) {
          console.error("ML Service Warning:", err.message);
        }
      }
    }

    // EYES & RISK ENGINE EVALUATION
    const riskResult = evaluateTransactionRisk({
      amount: paymentAmount,
      similarity: mlData.similarity,
      qualityScore: mlData.quality_score || 0.9,
      livenessScore: mlData.liveness_score || 0.95,
      failedAttempts: mlData.verified ? 0 : 1,
    });

    // HIGH RISK BLOCK
    if (riskResult.action === "BLOCK" && !isPinVerified) {
      await FraudAlert.create({
        userId: user._id,
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        reason: "Suspicious biometric & high-risk payment parameters",
        actionTaken: "BLOCK",
      });

      return res.status(403).json({
        success: false,
        action: "BLOCK",
        riskScore: riskResult.riskScore,
        message: "Security Alert: High risk score detected. Payment blocked.",
      });
    }

    // MEDIUM RISK CHALLENGE (Require PIN Fallback if not verified by high similarity)
    if (!mlData.verified && !isPinVerified) {
      return res.status(401).json({
        success: false,
        action: "PIN_CHALLENGE",
        riskScore: riskResult.riskScore,
        similarity: mlData.similarity,
        message: "Palm biometric scan unverified. Enter your 4-digit PIN to complete authorization.",
      });
    }

    // CHECK BALANCE
    const currentBalance = Number(user.walletBalance) || 0;
    if (currentBalance < paymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        balance: currentBalance,
      });
    }

    // DEDUCT & SAVE
    user.walletBalance = currentBalance - paymentAmount;
    await user.save();

    const targetRecipient = recipientName || "Nayantara V";
    const targetPhone = recipientPhone || "+91 8050530XXX";
    const targetCategory = category || "Transfer";

    const transaction = await Transaction.create({
      userId: user._id,
      amount: paymentAmount,
      type: "PALM_PAYMENT",
      recipientName: targetRecipient,
      recipientPhone: targetPhone,
      category: targetCategory,
      status: "COMPLETED",
      transactionId: generateTransactionId(),
    });

    await AuditLog.create({
      userId: user._id,
      action: "PALM_PAYMENT_SUCCESS",
      details: `Paid ₹${paymentAmount} to ${targetRecipient} (Risk Score: ${riskResult.riskScore})`,
    });

    res.status(200).json({
      success: true,
      message: isPinVerified ? "Payment authorized via Security PIN" : "Payment authorized via Palm Biometrics",
      payment: {
        amount: paymentAmount,
        recipientName: transaction.recipientName,
        recipientPhone: transaction.recipientPhone,
        remainingBalance: user.walletBalance,
        transactionId: transaction.transactionId,
        status: transaction.status,
        date: transaction.createdAt,
        similarity: mlData.similarity,
        riskScore: riskResult.riskScore,
        authMethod: isPinVerified ? "PIN" : "PALM",
      },
    });

  } catch (error) {
    console.error("PALM PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed: " + (error.message || "Server error"),
    });
  }
};

module.exports = {
  payWithPalm,
};