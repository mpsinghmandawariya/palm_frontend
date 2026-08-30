const express = require("express");
const { body } = require("express-validator");
const { getWallet, topUp } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", authMiddleware, getWallet);

router.post(
  "/topup",
  authMiddleware,
  [
    body("amount").isFloat({ gt: 0, lte: 500000 }).withMessage("Top-up amount must be greater than zero"),
    validateRequest,
  ],
  topUp
);

// Backward-compatibility alias
router.post(
  "/top-up",
  authMiddleware,
  [
    body("amount").isFloat({ gt: 0, lte: 500000 }).withMessage("Top-up amount must be greater than zero"),
    validateRequest,
  ],
  topUp
);

module.exports = router;