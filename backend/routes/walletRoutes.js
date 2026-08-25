const express = require("express");

const {
  getWallet,
} = require("../controllers/walletController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getWallet
);

module.exports = router;