const express = require("express");
const { query, param } = require("express-validator");
const { getTransactions, getTransactionById } = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    validateRequest,
  ],
  getTransactions
);

router.get(
  "/:id",
  authMiddleware,
  [
    param("id").isMongoId().withMessage("Invalid transaction ID format"),
    validateRequest,
  ],
  getTransactionById
);

module.exports = router;