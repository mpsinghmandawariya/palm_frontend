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

    // -----------------------------
    // Validate amount
    // -----------------------------

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount",
      });
    }

    const paymentAmount = Number(amount);


    // -----------------------------
    // Temporary ML verification
    // -----------------------------

    if (palmVerified !== true) {
      return res.status(401).json({
        success: false,
        message: "Palm verification failed",
      });
    }


    // -----------------------------
    // Find user
    // -----------------------------

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // -----------------------------
    // Check balance
    // -----------------------------

    if (user.walletBalance < paymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
        balance: user.walletBalance,
      });
    }


    // -----------------------------
    // Deduct amount
    // -----------------------------

    user.walletBalance -= paymentAmount;

    await user.save();


    // -----------------------------
    // Create transaction
    // -----------------------------

    const transaction = await Transaction.create({
      userId: user._id,
      amount: paymentAmount,
      type: "PALM_PAYMENT",
      status: "COMPLETED",
      transactionId: generateTransactionId(),
    });


    // -----------------------------
    // Response
    // -----------------------------

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
      "Palm payment error:",
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