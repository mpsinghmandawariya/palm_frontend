require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const walletService = require("../services/walletService");
const AppError = require("../utils/AppError");

describe("walletService Atomic Debit/Credit Tests", () => {
  let testUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/palm_pay";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  });

  afterAll(async () => {
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    testUser = await User.create({
      name: "Wallet Test User",
      email: `test_${Date.now()}@palmpay.internal`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash: "dummyHash123",
      pin: "dummyPinHash123",
      walletBalance: 1000,
    });
  });

  afterEach(async () => {
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
  });

  test("debit() atomically deducts balance when funds are sufficient", async () => {
    const newBalance = await walletService.debit(testUser._id, 300);
    expect(newBalance).toBe(700);

    const refreshed = await User.findById(testUser._id);
    expect(refreshed.walletBalance).toBe(700);
  });

  test("debit() throws 400 INSUFFICIENT_BALANCE when balance < amount", async () => {
    await expect(walletService.debit(testUser._id, 1500)).rejects.toThrow(AppError);

    const refreshed = await User.findById(testUser._id);
    expect(refreshed.walletBalance).toBe(1000);
  });

  test("credit() atomically increases balance", async () => {
    const newBalance = await walletService.credit(testUser._id, 500);
    expect(newBalance).toBe(1500);

    const refreshed = await User.findById(testUser._id);
    expect(refreshed.walletBalance).toBe(1500);
  });

  test("Concurrent debits prevent double-spending overdraft", async () => {
    const results = await Promise.allSettled([
      walletService.debit(testUser._id, 600),
      walletService.debit(testUser._id, 600),
    ]);

    const successes = results.filter((r) => r.status === "fulfilled");
    const rejections = results.filter((r) => r.status === "rejected");

    expect(successes.length).toBe(1);
    expect(rejections.length).toBe(1);

    const refreshed = await User.findById(testUser._id);
    expect(refreshed.walletBalance).toBe(400);
  });
});
