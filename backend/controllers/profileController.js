const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email mobile dob aadhaarTestId walletBalance palmRegistered createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        aadhaarTestId: user.aadhaarTestId,
        walletBalance: user.walletBalance,
        palmRegistered: user.palmRegistered,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};

module.exports = {
  getProfile,
};