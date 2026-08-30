const express = require("express");
const { body } = require("express-validator");
const { createSession, identifyPalm, authorizePayment } = require("../controllers/posController");
const authMiddleware = require("../middleware/authMiddleware");
const merchantMiddleware = require("../middleware/merchantMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { posIdentifyLimiter } = require("../middleware/rateLimiter");
const { isValidBase64Image } = require("../utils/imageUtils");

const router = express.Router();

router.post(
  "/session",
  authMiddleware,
  merchantMiddleware,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("POS session amount must be a positive number"),
    validateRequest,
  ],
  createSession
);

router.post(
  "/identify",
  authMiddleware,
  posIdentifyLimiter,
  [
    body("sessionId").isMongoId().withMessage("Valid POS sessionId is required"),
    body("image")
      .notEmpty()
      .withMessage("Live palm scan image is required")
      .custom((value) => {
        if (!isValidBase64Image(value)) {
          throw new Error("Image must be a valid base64 data-URL");
        }
        return true;
      }),
    validateRequest,
  ],
  identifyPalm
);

router.post(
  "/authorize",
  authMiddleware,
  merchantMiddleware,
  [
    body("sessionId").isMongoId().withMessage("Valid POS sessionId is required"),
    validateRequest,
  ],
  authorizePayment
);

module.exports = router;
