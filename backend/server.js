const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const palmRoutes = require("./routes/palmRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const billsRoutes = require("./routes/billsRoutes");
const autoPayRoutes = require("./routes/autoPayRoutes");
const savingsRewardsRoutes = require("./routes/savingsRewardsRoutes");
const aiAssistantRoutes = require("./routes/aiAssistantRoutes");
const merchantRoutes = require("./routes/merchantRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/palm", palmRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile", profileRoutes);

// Enterprise Fintech & AI Modules
app.use("/api/bills", billsRoutes);
app.use("/api/autopay", autoPayRoutes);
app.use("/api/savings-rewards", savingsRewardsRoutes);
app.use("/api/ai/assistant", aiAssistantRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Palm Pay Enterprise API v2.0 is running",
    services: [
      "auth",
      "biometrics",
      "wallet",
      "payments",
      "bills",
      "autopay",
      "savings",
      "rewards",
      "ai_assistant",
      "merchant",
      "admin",
    ],
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/palm_pay";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });