const express = require("express");
const { getAutoPays, createAutoPay, toggleAutoPay } = require("../controllers/autoPayController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", authMiddleware, getAutoPays);
router.post("/", authMiddleware, createAutoPay);
router.patch("/:id", authMiddleware, toggleAutoPay);

module.exports = router;
