const express = require("express");

const {
  getTransactions,
  getTransactionById,
} = require("../controllers/transactionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getTransactions
);

router.get(
  "/:id",
  authMiddleware,
  getTransactionById
);

module.exports = router;