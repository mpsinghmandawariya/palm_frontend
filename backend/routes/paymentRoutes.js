const express = require("express");

const {
  payWithPalm,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/pay",
  authMiddleware,
  payWithPalm
);

module.exports = router;