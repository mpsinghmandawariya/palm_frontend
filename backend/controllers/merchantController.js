const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const getMerchantDetails = async (req, res) => {
  try {
    let merchant = await Merchant.findOne({ userId: req.userId }).lean();
    if (!merchant) {
      const user = await User.findById(req.userId);
      merchant = await Merchant.create({
        userId: req.userId,
        businessName: `${user.name}'s Store`,
        category: "Retail & Commerce",
        merchantQrCode: `EP-QR-${req.userId}`,
        totalSalesVolume: 12450,
      });
    }

    const sales = await Transaction.find({ recipientName: merchant.businessName }).lean();

    res.json({
      success: true,
      merchant,
      sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMerchantDetails };
