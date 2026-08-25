const User = require("../models/User");

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

module.exports = {
  getWallet,
};