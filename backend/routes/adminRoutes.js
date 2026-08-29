const express = require("express");
const { getAdminDashboardMetrics } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/metrics", authMiddleware, getAdminDashboardMetrics);

module.exports = router;
