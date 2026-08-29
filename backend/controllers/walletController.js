const User = require("../models/User");
const Transaction = require("../models/Transaction");

const generateTransactionId = () => {
  return (
    "EP-TOP-" +
    Date.now() +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
};

const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email mobile walletBalance palmRegistered"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance,
        currency: "INR",
        palmRegistered: user.palmRegistered,
      },
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("Wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch wallet",
    });
  }
};

const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const topUpAmount = Number(amount);

    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid top-up amount",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.walletBalance = (Number(user.walletBalance) || 0) + topUpAmount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      amount: topUpAmount,
      type: "WALLET_TOPUP",
      recipientName: "Wallet Top-up",
      category: "Top Up",
      status: "COMPLETED",
      transactionId: generateTransactionId(),
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ₹${topUpAmount} to your wallet!`,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.error("Top up error:", error);
    res.status(500).json({
      success: false,
      message: "Top up failed: " + (error.message || "Server error"),
    });
  }
};

module.exports = {
  getWallet,
  topUpWallet,
};