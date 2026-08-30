const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const reqId = req.requestId || null;

  // Operational AppError: return predictable structured JSON
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message} [${err.code}]`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    }, reqId);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details || undefined,
    });
  }

  // Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    logger.warn(`Duplicate key constraint on ${field}`, { keyValue: err.keyValue }, reqId);

    let userMessage = `An item with this ${field} already exists`;
    if (field === "email") {
      userMessage = "An account with this email address already exists";
    } else if (field === "phone" || field === "mobile") {
      userMessage = "An account with this mobile number already exists";
    } else if (field === "transactionId") {
      userMessage = "Transaction reference collision. Please retry.";
    }

    return res.status(409).json({
      success: false,
      message: userMessage,
      code: `${field.toUpperCase()}_ALREADY_EXISTS`,
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    logger.warn(`Mongoose ValidationError: ${messages.join(", ")}`, null, reqId);
    return res.status(400).json({
      success: false,
      message: messages[0] || "Invalid input data",
      code: "VALIDATION_ERROR",
      details: messages,
    });
  }

  // Unexpected Bugs / System Exceptions: log full stack server-side, return clean 500
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  }, reqId);

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
    code: "INTERNAL_SERVER_ERROR",
  });
};

module.exports = errorHandler;
