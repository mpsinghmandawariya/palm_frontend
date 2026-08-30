const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

// Startup validation for critical environment variables
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    logger.error("FATAL: JWT_SECRET environment variable is not set. Exiting process.");
    process.exit(1);
  } else {
    logger.warn("WARNING: JWT_SECRET is not set in .env. Generating a session secret.");
    process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  }
}

// Route imports
const authRoutes = require("./routes/authRoutes");
const palmRoutes = require("./routes/palmRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const posRoutes = require("./routes/posRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

// Connect Database
connectDB();

// Production Security Headers (Helmet.js)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow cross-origin camera / assets in dev/demo
    crossOriginEmbedderPolicy: false,
  })
);

// Global Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" })); // Capped request body size (Section 5, Item 22)
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Correlation ID & Request Logging Middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.requestId);

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, null, req.requestId);
  });

  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/palm", palmRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/health", healthRoutes);

// Root Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Palm Pay Enterprise API",
    version: "2.3.0",
    docs: "/api/health",
  });
});

// Unhandled Route 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
});

// Centralized Error Handling Middleware (Registered LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Palm Pay Backend Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});