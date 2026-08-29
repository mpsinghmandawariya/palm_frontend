/**
 * Palm Pay AI Transaction Risk Engine
 * Computes a 0-100 real-time transaction risk score based on biometrics, liveness, amount, and attempt metrics.
 */

function evaluateTransactionRisk({
  amount = 0,
  similarity = 0,
  qualityScore = 1.0,
  livenessScore = 1.0,
  failedAttempts = 0,
}) {
  let riskScore = 15; // Baseline low risk

  // 1. Biometric Similarity Factor
  if (similarity < 0.70) {
    riskScore += 55;
  } else if (similarity < 0.80) {
    riskScore += 25;
  } else if (similarity >= 0.88) {
    riskScore -= 10;
  }

  // 2. Liveness / Anti-Spoof Factor
  if (livenessScore < 0.45) {
    riskScore += 45;
  } else if (livenessScore < 0.60) {
    riskScore += 20;
  }

  // 3. High-Value Transaction Factor
  if (amount > 10000) {
    riskScore += 25;
  } else if (amount > 3000) {
    riskScore += 10;
  }

  // 4. Repeated Failed Attempts Factor
  if (failedAttempts >= 3) {
    riskScore += 40;
  } else if (failedAttempts === 2) {
    riskScore += 20;
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  let riskLevel = "LOW";
  let action = "PROCEED";
  let message = "Transaction risk acceptable. Biometrics verified.";

  if (finalScore >= 70) {
    riskLevel = "HIGH";
    action = "BLOCK";
    message = "High transaction risk detected. Security block engaged.";
  } else if (finalScore >= 35) {
    riskLevel = "MEDIUM";
    action = "PIN_CHALLENGE";
    message = "Medium risk level detected. 4-digit security PIN verification required.";
  }

  return {
    riskScore: finalScore,
    riskLevel,
    action,
    message,
    metrics: {
      similarity,
      qualityScore,
      livenessScore,
      failedAttempts,
    },
  };
}

module.exports = {
  evaluateTransactionRisk,
};
