const express = require("express");

const {
  getWallet,
  topUpWallet,
} = require("../controllers/walletController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getWallet);
router.post("/top-up", authMiddleware, topUpWallet);

module.exports = router;