const User = require("../models/User");
const Transaction = require("../models/Transaction");

const generateTransactionId = () => {
  return (
    "PP-" +
    Date.now() +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
};

const payWithPalm = async (req, res) => {
  try {
    const { amount, palmVerified } = req.body;

    const paymentAmount = Number(amount);

    // Validate amount
    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    // Maximum 2 decimal places
    if (
      Math.round(paymentAmount * 100) !==
      paymentAmount * 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount can have maximum 2 decimal places",
      });
    }

    // Temporary palm verification
    if (palmVerified !== true) {
      return res.status(401).json({
        success: false,
        message: "Palm verification failed",
      });
    }

    // Find authenticated user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check balance
    const currentBalance =
      Number(user.walletBalance) || 0;

    if (currentBalance < paymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        balance: currentBalance,
      });
    }

    // Deduct balance
    user.walletBalance =
      currentBalance - paymentAmount;

    await user.save();

    // Create transaction
    const transaction =
      await Transaction.create({
        userId: user._id,
        amount: paymentAmount,
        type: "PALM_PAYMENT",
        status: "COMPLETED",
        transactionId: generateTransactionId(),
      });

    res.status(200).json({
      success: true,
      message: "Payment successful",

      payment: {
        amount: paymentAmount,

        remainingBalance:
          user.walletBalance,

        transactionId:
          transaction.transactionId,

        status: transaction.status,

        date: transaction.createdAt,
      },
    });

  } catch (error) {
    console.error(
      "PALM PAYMENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};

module.exports = {
  payWithPalm,
};