const Biller = require("../models/Biller");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");

const getBillers = async (req, res) => {
  try {
    let billers = await Biller.find().lean();
    if (!billers || billers.length === 0) {
      // Seed default billers
      const seedBillers = [
        { billerId: "MOB-AIRTEL", name: "Airtel Prepaid & Postpaid", category: "Mobile", icon: "Smartphone" },
        { billerId: "MOB-JIO", name: "Jio Infocomm Telecom", category: "Mobile", icon: "Smartphone" },
        { billerId: "ELEC-BESCOM", name: "BESCOM Bangalore Electricity", category: "Electricity", icon: "Zap" },
        { billerId: "ELEC-TATA", name: "Tata Power Distribution", category: "Electricity", icon: "Zap" },
        { billerId: "WATER-BWSSB", name: "BWSSB Metropolitan Water Supply", category: "Water", icon: "Droplets" },
        { billerId: "DTH-TATA", name: "Tata Play DTH Network", category: "DTH", icon: "Tv" },
        { billerId: "BB-ACT", name: "ACT Fibernet Broadband", category: "Broadband", icon: "Wifi" },
        { billerId: "FAST-ICICI", name: "ICICI FASTag Highway Recharge", category: "FASTag", icon: "Car" },
      ];
      await Biller.insertMany(seedBillers);
      billers = await Biller.find().lean();
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
      return res.status(400).json({ success: false, message: "Please enter a valid bill payment amount" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    if (user.walletBalance < billAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance (Available: ₹${user.walletBalance.toLocaleString("en-IN")})`,
      });
    }

    user.walletBalance -= billAmount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      amount: billAmount,
      type: "BILL_PAYMENT",
      recipientName: billerId || "Utility Biller",
      recipientPhone: consumerNumber || "Consumer A/C",
      category: category || "Bills & Utilities",
      status: "COMPLETED",
      transactionId: "PALM-BILL-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000),
    });

    await AuditLog.create({
      userId: user._id,
      action: "BILL_PAYMENT_SUCCESS",
      details: `Paid ₹${billAmount} for ${category || "Utility Bill"} (${billerId})`,
    });

    res.json({
      success: true,
      message: `Successfully paid ₹${billAmount.toLocaleString("en-IN")} for ${category || "Utility Bill"}`,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBillers, payBill };

