const mongoose = require("mongoose");
const mlService = require("../services/mlService");

describe("Health Check Unit Tests", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/palm_pay_test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("MongoDB connection reports readyState === 1", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("mlService.checkHealth() returns valid status object", async () => {
    const health = await mlService.checkHealth();
    expect(health).toHaveProperty("status");
    expect(["ok", "unreachable"]).toContain(health.status);
  });
});
