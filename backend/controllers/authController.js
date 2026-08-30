const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "palm_pay_super_secret_2026", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const rawPhone = req.body.phone || req.body.mobile || "";
  const rawPin = req.body.pin || "1234";

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = rawPhone.trim();

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new AppError("An account with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
    }
    throw new AppError("An account with this phone number already exists", 409, "PHONE_ALREADY_EXISTS");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const pinHash = await bcrypt.hash(String(rawPin), salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    passwordHash,
    pin: pinHash,
    walletBalance: 5000, // Demo starting balance
    palmRegistered: false,
    role: "user",
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      walletBalance: user.walletBalance,
      palmRegistered: user.palmRegistered,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const rawId = (req.body.identifier || req.body.email || req.body.phone || req.body.mobile || "").trim();

  if (!rawId) {
    throw new AppError("Email or mobile number is required", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = rawId.toLowerCase();
  const user = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: rawId }],
  }).select("+passwordHash");

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      walletBalance: user.walletBalance,
      palmRegistered: user.palmRegistered,
      role: user.role,
    },
  });
});

module.exports = {
  register,
  login,
};