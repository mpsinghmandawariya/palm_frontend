const SavingsGoal = require("../models/SavingsGoal");
const Reward = require("../models/Reward");

const getSavings = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId }).lean();
    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSavingsGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category } = req.body;
    const goal = await SavingsGoal.create({
      userId: req.userId,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline: deadline ? new Date(deadline) : null,
      category: category || "General",
    });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ userId: req.userId }).lean();
    if (rewards.length === 0) {
      const seedRewards = [
        { userId: req.userId, title: "Palm Pay Signup Cashback", type: "CASHBACK", value: 100, isRevealed: true },
        { userId: req.userId, title: "Summer Biometrics Scratch Card", type: "SCRATCH_CARD", value: 50, isRevealed: false },
      ];
      await Reward.insertMany(seedRewards);
      return res.json({ success: true, rewards: seedRewards });
    }
    res.json({ success: true, rewards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const revealReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await Reward.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isRevealed: true },
      { new: true }
    );
    res.json({ success: true, reward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSavings, createSavingsGoal, getRewards, revealReward };
