const Biller = require("../models/Biller");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getBillers = async (req, res) => {
  try {
    const billers = await Biller.find().lean();
    if (billers.length === 0) {
      // Seed default billers
      const seedBillers = [
        { billerId: "MOB-AIRTEL", name: "Airtel Prepaid/Postpaid", category: "Mobile", icon: "📱" },
        { billerId: "ELEC-BESCOM", name: "BESCOM Electricity", category: "Electricity", icon: "⚡" },
        { billerId: "WATER-BWSSB", name: "BWSSB Water Board", category: "Water", icon: "💧" },
        { billerId: "DTH-TATA", name: "Tata Play DTH", category: "DTH", icon: "📺" },
        { billerId: "BB-ACT", name: "ACT Fibernet Broadband", category: "Broadband", icon: "🌐" },
        { billerId: "FAST-ICICI", name: "ICICI FASTag Recharge", category: "FASTag", icon: "🚗" },
      ];
      await Biller.insertMany(seedBillers);
      return res.json({ success: true, billers: seedBillers });
    }
    res.json({ success: true, billers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const payBill = async (req, res) => {
  try {
    const { billerId, consumerNumber, amount, category } = req.body;
    const billAmount = Number(amount);

    if (!billAmount || billAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid bill amount" });
    }

    const user = await User.findById(req.userId);
    if (user.walletBalance < billAmount) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
    }

    user.walletBalance -= billAmount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      amount: billAmount,
      type: "BILL_PAYMENT",
      recipientName: billerId || "Utility Biller",
      recipientPhone: consumerNumber || "1009283741",
      category: category || "Bills",
      status: "COMPLETED",
      transactionId: "EP-BILL-" + Date.now(),
    });

    res.json({
      success: true,
      message: `Successfully paid ₹${billAmount} for ${category || "Utility Bill"}`,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBillers, payBill };
