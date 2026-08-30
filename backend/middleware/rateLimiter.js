const { rateLimit } = require("express-rate-limit");
const AppError = require("../utils/AppError");

const createLimiter = ({ windowMs, max, message, code = "TOO_MANY_ATTEMPTS", keyGenerator = null }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => req.ip),
    handler: (req, res, next) => {
      next(new AppError(message, 429, code));
    },
  });
};

const loginLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
  keyGenerator: (req) => `${req.ip}_${req.body?.email || ""}`,
});

const pinPaymentLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_PIN_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PIN_MAX) || 5,
  message: "Too many incorrect PIN attempts. Please wait 15 minutes or verify using your palm.",
  keyGenerator: (req) => req.userId ? req.userId.toString() : req.ip,
});

const palmRegisterLimiter = createLimiter({
  windowMs: Number(process.env.RATE_LIMIT_PALM_REGISTER_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PALM_REGISTER_MAX) || 10,
  message: "Too many palm registration attempts. Please try again later.",
  keyGenerator: (req) => req.userId ? req.userId.toString() : req.ip,
});

const posIdentifyLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60, // 60 scans per minute per merchant terminal
  message: "POS scan rate limit exceeded. Please wait a moment.",
  keyGenerator: (req) => req.userId ? req.userId.toString() : req.ip,
});

module.exports = {
  loginLimiter,
  pinPaymentLimiter,
  palmRegisterLimiter,
  posIdentifyLimiter,
};
