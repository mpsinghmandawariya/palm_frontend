const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { base64ToBlob } = require("../utils/imageUtils");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const TIMEOUT_MS = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 8000;

async function postToML(endpoint, formData, requestId = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let detail = "Biometric processing error";
      try {
        const errJson = await response.json();
        detail = errJson.detail || detail;
      } catch {
        detail = await response.text();
      }

      if (response.status === 422) {
        if (detail.toLowerCase().includes("no hand") || detail.toLowerCase().includes("no palm")) {
          throw new AppError(detail, 422, "PALM_NOT_DETECTED");
        }
        if (detail.toLowerCase().includes("multiple hands")) {
          throw new AppError(detail, 422, "MULTIPLE_HANDS_DETECTED");
        }
        if (detail.toLowerCase().includes("quality")) {
          throw new AppError(detail, 422, "LOW_QUALITY");
        }
        throw new AppError(detail, 422, "BIOMETRIC_REJECTED");
      }

      if (response.status === 400) {
        throw new AppError(detail, 400, "BAD_IMAGE_DATA");
      }

      throw new AppError(detail || "ML service error", response.status, "ML_SERVICE_ERROR");
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === "AbortError") {
      logger.error(`ML Service timed out after ${TIMEOUT_MS}ms at ${endpoint}`, null, requestId);
      throw new AppError("Biometric processing timed out. Please try again.", 503, "ML_SERVICE_UNAVAILABLE");
    }

    logger.error(`ML Service communication failure at ${endpoint}: ${error.message}`, null, requestId);
    throw new AppError("Biometric inference engine is currently unreachable.", 503, "ML_SERVICE_UNAVAILABLE");
  }
}

const mlService = {
  async register(base64Image, requestId = null) {
    const blob = base64ToBlob(base64Image);
    const formData = new FormData();
    formData.append("file", blob, "palm_register.jpg");

    const result = await postToML("/register", formData, requestId);
    return {
      embedding: result.embedding,
      qualityScore: result.quality_score,
      livenessScore: result.liveness_score,
    };
  },

  async verify(base64Image, storedEmbedding, requestId = null) {
    const blob = base64ToBlob(base64Image);
    const formData = new FormData();
    formData.append("file", blob, "palm_verify.jpg");
    formData.append("target_embedding", JSON.stringify(storedEmbedding));

    const result = await postToML("/verify", formData, requestId);
    return {
      verified: result.verified,
      score: result.score,
      qualityScore: result.quality_score,
      livenessScore: result.liveness_score,
    };
  },

  async identify(base64Image, candidates, threshold = null, requestId = null) {
    const blob = base64ToBlob(base64Image);
    const formData = new FormData();
    formData.append("file", blob, "palm_identify.jpg");
    formData.append("candidates", JSON.stringify(candidates));
    if (threshold) {
      formData.append("threshold", String(threshold));
    }

    const result = await postToML("/identify", formData, requestId);
    return result; // { match: { id, score } } or { match: null }
  },

  async checkHealth() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${ML_SERVICE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return { status: "ok" };
      }
      return { status: "unreachable" };
    } catch {
      clearTimeout(timeoutId);
      return { status: "unreachable" };
    }
  },
};

module.exports = mlService;
