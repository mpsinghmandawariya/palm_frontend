const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { loginLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/register",
  (req, res, next) => {
    // Normalization helper: support both 'phone' and 'mobile' field names
    if (!req.body.phone && req.body.mobile) {
      req.body.phone = req.body.mobile;
    }
    next();
  },
  [
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email address is required"),
    body("phone").trim().matches(/^[0-9]{10}$/).withMessage("Phone must be a valid 10-digit mobile number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("pin").optional().isLength({ min: 4, max: 4 }).isNumeric().withMessage("PIN must be exactly 4 digits"),
    validateRequest,
  ],
  register
);

router.post(
  "/login",
  loginLimiter,
  (req, res, next) => {
    const rawId = (req.body.identifier || req.body.email || req.body.phone || req.body.mobile || "").trim();
    req.body.identifier = rawId;
    if (rawId.includes("@")) {
      req.body.email = rawId.toLowerCase();
    }
    next();
  },
  [
    body("identifier").notEmpty().withMessage("Email or mobile number is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
  ],
  login
);

module.exports = router;