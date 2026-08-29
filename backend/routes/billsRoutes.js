const express = require("express");
const { getBillers, payBill } = require("../controllers/billsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getBillers);
router.post("/pay", authMiddleware, payBill);

module.exports = router;
