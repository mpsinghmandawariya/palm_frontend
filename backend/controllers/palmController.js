const PalmProfile = require("../models/PalmProfile");
const User = require("../models/User");

const registerPalm = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Palm image is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingPalm = await PalmProfile.findOne({
      userId: req.userId,
    });

    if (existingPalm) {
      return res.status(409).json({
        success: false,
        message: "Palm is already registered",
      });
    }

    await PalmProfile.create({
      userId: req.userId,
      palmImage: image,
      status: "registered",
    });

    user.palmRegistered = true;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Palm registered successfully",
    });

  } catch (error) {
    console.error("Palm registration error:", error);

    res.status(500).json({
      success: false,
      message: "Palm registration failed",
    });
  }
};

module.exports = {
  registerPalm,
};