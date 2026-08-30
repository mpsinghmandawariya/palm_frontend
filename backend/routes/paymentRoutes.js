const express = require("express");
const { body, param } = require("express-validator");
const { pay, lookupPhone } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { pinPaymentLimiter } = require("../middleware/rateLimiter");
const { isValidBase64Image } = require("../utils/imageUtils");

const router = express.Router();

router.get(
  "/lookup/:phone",
  authMiddleware,
  [
    param("phone").trim().isLength({ min: 10, max: 10 }).withMessage("Phone must be a 10-digit number"),
    validateRequest,
  ],
  lookupPhone
);

router.post(
  "/pay",
  authMiddleware,
  (req, res, next) => {
    // Apply rate limiter specifically if PIN is supplied
    if (req.body?.pin) {
      return pinPaymentLimiter(req, res, next);
    }
    next();
  },
  [
    body("amount")
      .isFloat({ gt: 0, lte: 100000 })
      .withMessage("Amount must be a positive number up to ₹1,00,000"),
    body("recipientName")
      .optional()
      .trim(),
    body("recipientPhone")
      .optional()
      .trim(),
    body("image")
      .optional()
      .custom((value) => {
        if (value && !isValidBase64Image(value)) {
          throw new Error("Image must be a valid base64 data-URL");
        }
        return true;
      }),
    body("pin")
      .optional()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage("PIN must be exactly 4 digits"),
    body().custom((value, { req }) => {
      if (!req.body.image && !req.body.pin) {
        throw new Error("Either a palm scan image or security PIN must be provided");
      }
      return true;
    }),
    validateRequest,
  ],
  pay
);

module.exports = router;