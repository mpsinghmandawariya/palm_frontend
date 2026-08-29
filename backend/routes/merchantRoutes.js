const express = require("express");
const { getMerchantDetails } = require("../controllers/merchantController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getMerchantDetails);

module.exports = router;
