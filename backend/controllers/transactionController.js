const Transaction = require("../models/Transaction");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = { payerId: req.userId };
  if (req.query.type) {
    filter.type = req.query.type;
  }

  const [transactions, totalCount] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  res.status(200).json({
    success: true,
    transactions,
    page,
    limit,
    totalPages,
    totalCount,
  });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    _id: id,
    payerId: req.userId,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404, "TRANSACTION_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    transaction,
  });
});

module.exports = {
  getTransactions,
  getTransactionById,
};