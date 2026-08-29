const express = require("express");
const { processAiQuery } = require("../controllers/aiAssistantController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/query", authMiddleware, processAiQuery);

module.exports = router;
