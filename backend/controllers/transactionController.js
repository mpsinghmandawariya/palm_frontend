const Transaction = require("../models/Transaction");

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(
      "Transaction history error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load transactions",
    });
  }
};


const getTransactionById = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(
      "Transaction details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load transaction",
    });
  }
};


module.exports = {
  getTransactions,
  getTransactionById,
};