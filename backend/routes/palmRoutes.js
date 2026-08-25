const express = require("express");

const {
  registerPalm,
} = require("../controllers/palmController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  registerPalm
);

module.exports = router;