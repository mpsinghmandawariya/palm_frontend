const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const transactionRoutes = require("./routes/transactionRoutes");
const profileRoutes = require(
  "./routes/profileRoutes"
);
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const palmRoutes = require("./routes/palmRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();


// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/palm", palmRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/profile",profileRoutes);



// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Palm Pay API is running",
  });
});


// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running on http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });