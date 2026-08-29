const User = require("../models/User");
const Transaction = require("../models/Transaction");
const FraudAlert = require("../models/FraudAlert");
const AuditLog = require("../models/AuditLog");
const PalmProfile = require("../models/PalmProfile");

const getAdminDashboardMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const palmProfiles = await PalmProfile.countDocuments();
    const fraudAlerts = await FraudAlert.find().sort({ createdAt: -1 }).limit(10).lean();
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10).lean();
    const users = await User.find().select("name email mobile walletBalance palmRegistered createdAt").limit(10).lean();

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalTransactions,
        palmProfiles,
        activeFraudAlerts: fraudAlerts.length,
      },
      users,
      fraudAlerts,
      auditLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminDashboardMetrics };
