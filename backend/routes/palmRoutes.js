const express = require("express");
const { body } = require("express-validator");
const { recordConsent, registerPalm, getPalmStatus, deletePalm } = require("../controllers/palmController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { palmRegisterLimiter } = require("../middleware/rateLimiter");
const { isValidBase64Image } = require("../utils/imageUtils");

const router = express.Router();

router.post("/consent", authMiddleware, recordConsent);

router.post(
  "/register",
  authMiddleware,
  palmRegisterLimiter,
  [
    body("image")
      .notEmpty()
      .withMessage("Palm scan image is required")
      .custom((value) => {
        if (!isValidBase64Image(value)) {
          throw new Error("Image must be a valid base64 data-URL (JPEG, PNG, WEBP)");
        }
        return true;
      }),
    validateRequest,
  ],
  registerPalm
);

router.get("/status", authMiddleware, getPalmStatus);
router.delete("/", authMiddleware, deletePalm);
router.delete("/revoke", authMiddleware, deletePalm);

module.exports = router;