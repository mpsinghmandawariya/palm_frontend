const express = require("express");
const { getSavings, createSavingsGoal, getRewards, revealReward } = require("../controllers/savingsRewardsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/savings", authMiddleware, getSavings);
router.post("/savings", authMiddleware, createSavingsGoal);
router.get("/rewards", authMiddleware, getRewards);
router.post("/rewards/:id/reveal", authMiddleware, revealReward);

module.exports = router;
