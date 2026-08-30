const mongoose = require("mongoose");
const mlService = require("../services/mlService");
const asyncHandler = require("../utils/asyncHandler");

const getHealth = asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "ok" : "disconnected";
  const mlHealth = await mlService.checkHealth();

  res.status(200).json({
    mongo: mongoStatus,
    mlService: mlHealth.status,
  });
});

module.exports = {
  getHealth,
};
