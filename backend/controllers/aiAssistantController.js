const Transaction = require("../models/Transaction");
const AutoPayMandate = require("../models/AutoPayMandate");

const processAiQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query text is required" });
    }

    const lowerQuery = query.toLowerCase();

    // Security Filter: Block requests asking for PIN, Password, Secrets
    if (lowerQuery.includes("pin") || lowerQuery.includes("password") || lowerQuery.includes("otp") || lowerQuery.includes("secret")) {
      return res.json({
        success: true,
        answer: "🔒 Security Alert: For your protection, I cannot disclose or handle sensitive PINs, passwords, or authentication secrets.",
      });
    }

    const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();

    if (lowerQuery.includes("largest") || lowerQuery.includes("highest") || lowerQuery.includes("biggest")) {
      if (transactions.length === 0) {
        return res.json({ success: true, answer: "You don't have any recorded transactions yet." });
      }
      const maxTx = transactions.reduce((max, item) => (item.amount > max.amount ? item : max), transactions[0]);
      return res.json({
        success: true,
        answer: `Your largest expense was ₹${maxTx.amount.toLocaleString("en-IN")} paid to ${maxTx.recipientName} on ${new Date(maxTx.createdAt).toLocaleDateString("en-IN")}.`,
      });
    }

    if (lowerQuery.includes("spend") || lowerQuery.includes("total") || lowerQuery.includes("month")) {
      const totalSpent = transactions
        .filter((t) => t.type !== "WALLET_TOPUP" && t.status === "COMPLETED")
        .reduce((sum, t) => sum + t.amount, 0);

      return res.json({
        success: true,
        answer: `You have spent a total of ₹${totalSpent.toLocaleString("en-IN")} across ${transactions.length} transactions this month.`,
      });
    }

    if (lowerQuery.includes("next payment") || lowerQuery.includes("autopay") || lowerQuery.includes("bill")) {
      const mandates = await AutoPayMandate.find({ userId: req.userId, status: "ACTIVE" }).lean();
      if (mandates.length === 0) {
        return res.json({ success: true, answer: "You have no active AutoPay mandates scheduled." });
      }
      const nextM = mandates[0];
      return res.json({
        success: true,
        answer: `Your next scheduled payment is ₹${nextM.amount} for ${nextM.title} on ${new Date(nextM.nextPaymentDate).toLocaleDateString("en-IN")}.`,
      });
    }

    // Default recent transactions insight
    if (transactions.length > 0) {
      const latest = transactions[0];
      return res.json({
        success: true,
        answer: `Your last transaction was ₹${latest.amount.toLocaleString("en-IN")} paid to ${latest.recipientName} (${latest.status}). You currently have ${transactions.length} recorded ledger items.`,
      });
    }

    return res.json({
      success: true,
      answer: "I am your EasyPay AI Financial Assistant. Ask me about your monthly spending, largest transactions, or upcoming AutoPay bills!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processAiQuery };
