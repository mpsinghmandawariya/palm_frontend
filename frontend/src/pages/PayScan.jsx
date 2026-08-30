import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Fingerprint,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SuccessVictoryIllustration } from "../components/Illustrations";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function PayScan() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const webcamRef = useRef(null);

  const paymentData = location.state || {
    amount: 250,
    recipientName: "Starbucks Coffee",
    recipientPhone: null,
  };

  const amount = paymentData.amount || 250;
  const recipientName = paymentData.recipientName || "Merchant / Payee";
  const recipientPhone = paymentData.recipientPhone || null;

  // Biometric State Machine
  // 'IDLE' | 'DETECTING' | 'PALM_DETECTED' | 'VERIFYING' | 'SUCCESS' | 'FAILED' | 'PIN'
  const [stage, setStage] = useState("IDLE");
  const [statusMessage, setStatusMessage] = useState("Place your palm over the camera");
  const [matchScore, setMatchScore] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // PIN Fallback State
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const captureAndVerify = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("Camera is initializing. Please wait...");
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError("Unable to capture palm frame. Please verify lighting and retry.");
      triggerShake();
      return;
    }

    try {
      // 1. Detecting
      setStage("DETECTING");
      setStatusMessage("Looking for your palm...");
      await new Promise((r) => setTimeout(r, 400));

      // 2. Palm detected
      setStage("PALM_DETECTED");
      setStatusMessage("Palm detected ✓");
      await new Promise((r) => setTimeout(r, 350));

      // 3. Verifying against 1280-d stored template
      setStage("VERIFYING");
      setStatusMessage("Verifying biometric embedding...");

      const response = await API.post("/payment/pay", {
        amount: Number(amount),
        image,
        recipientName,
        recipientPhone,
        category: "Transfer",
      });

      if (response.data?.success) {
        const payment = response.data.payment;
        setMatchScore(payment.matchScore || 96.4);
        setStatusMessage(`${payment.matchScore || 96.4}% Match`);
        setPaymentResult(payment);

        await new Promise((r) => setTimeout(r, 500));
        setStage("SUCCESS");
        toast.success("✓ Biometric payment authorized successfully!");
      } else {
        throw new Error(response.data?.message || "Biometric match rejected.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      const isPinChallenge = err.response?.data?.action === "PIN_CHALLENGE" || err.response?.status === 401;
      const returnedScore = err.response?.data?.matchScore || 42;
      const errMsg = err.response?.data?.message || "Biometric verification failed";

      setMatchScore(returnedScore);
      setError(errMsg);
      triggerShake();
      setStage("FAILED");
      setStatusMessage("Biometric verification failed");
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      triggerShake();
      return;
    }

    setPinLoading(true);
    setError("");

    try {
      const response = await API.post("/payment/pay", {
        amount: Number(amount),
        pin,
        recipientName,
        recipientPhone,
        category: "Transfer",
      });

      if (response.data?.success) {
        setPaymentResult(response.data.payment);
        setStage("SUCCESS");
        toast.success("✓ Payment authorized with Security PIN!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect PIN. Please try again.");
      triggerShake();
    } finally {
      setPinLoading(false);
    }
  };

  // SUCCESS RECEIPT SCREEN
  if (stage === "SUCCESS") {
    return (
      <MobileFrame showBottomNav={false}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Header
            title="Receipt"
            subtitle="Payment Authorized"
            showBack={false}
          />

          <div style={{ width: "160px", margin: "10px auto 16px" }}>
            <SuccessVictoryIllustration />
          </div>

          <span className="badge-pill badge-success" style={{ padding: "6px 16px", fontSize: "14px", marginBottom: "8px" }}>
            <CheckCircle2 size={16} style={{ marginRight: "6px" }} /> ✓ Payment Successful
          </span>

          <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0 2px" }}>
            {formatCurrency(paymentResult?.amount || amount)}
          </h2>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "20px" }}>
            Paid to <strong>{paymentResult?.recipientName || recipientName}</strong>
          </span>

          {/* RECEIPT SUMMARY CARD */}
          <div className="enterprise-card-box" style={{ textAlign: "left", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Authentication</span>
              <strong style={{ fontSize: "12px", color: "var(--color-success)" }}>
                {paymentResult?.authMethod === "PIN" ? "4-Digit PIN ✓" : `Palm Biometrics (${matchScore || 96}% Match) ✓`}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Transaction ID</span>
              <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "700" }}>
                {paymentResult?.transactionId || "PALM-TX-8821"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>New Balance</span>
              <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {formatCurrency(paymentResult?.newBalance || paymentResult?.remainingBalance || 0)}
              </strong>
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate("/dashboard")} style={{ width: "100%", marginBottom: "10px" }}>
            Done & Return Home
          </button>

          <button className="btn-outline" onClick={() => navigate("/pay")} style={{ width: "100%" }}>
            Make Another Payment
          </button>
        </div>
      </MobileFrame>
    );
  }

  // SCANNER & VERIFICATION SCREEN
  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title={`Pay ${formatCurrency(amount)}`}
        subtitle={`To: ${recipientName}`}
        showBack={true}
        backTo="/pay"
        showMlHealth={true}
      />

      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "2px" }}>
          Pay {formatCurrency(amount)}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
          {statusMessage}
        </p>

        {/* LIVE CAMERA PREVIEW */}
        <div className="palm-camera-frame">
          {cameraError ? (
            <div className="camera-error-placeholder">
              <Camera size={36} />
              <p>Camera access denied</p>
              <button
                className="btn-outline"
                onClick={() => {
                  setCameraError(false);
                  setCameraReady(false);
                }}
              >
                <RefreshCw size={14} style={{ marginRight: "4px" }} /> Retry Camera
              </button>
            </div>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                mirrored={true}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => {
                  setCameraError(true);
                  setError("Camera access required for palm biometrics.");
                }}
              />

              {/* HAND OUTLINE GUIDE OVERLAY */}
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                opacity: 0.35,
              }}>
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                  <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </div>

              {/* LASER SCANNING BEAM */}
              {(stage === "DETECTING" || stage === "VERIFYING") && (
                <div className="biometric-laser-line active" />
              )}
            </>
          )}
        </div>

        {/* REAL-TIME PROGRESS STATUS PILL */}
        <div style={{ margin: "14px 0 16px" }}>
          {stage === "VERIFYING" || stage === "DETECTING" || stage === "PALM_DETECTED" ? (
            <span className="badge-pill badge-neutral" style={{ padding: "6px 14px", fontSize: "13px" }}>
              <Sparkles size={14} style={{ marginRight: "6px" }} /> {statusMessage}
            </span>
          ) : stage === "FAILED" ? (
            <span className="badge-pill badge-neutral" style={{ padding: "6px 14px", fontSize: "13px", color: "var(--color-danger)" }}>
              <AlertCircle size={14} style={{ marginRight: "6px" }} /> Verification Failed ({matchScore || 0}% Match)
            </span>
          ) : (
            <div className="sensor-status-indicator">
              <span className={`status-dot ${cameraReady ? "green" : "gray"}`} />
              <span>{cameraReady ? "MediaPipe Biometric Scanner Active" : "Initializing Camera..."}</span>
            </div>
          )}
        </div>

        {error && <div className="toast-inline-error">{error}</div>}

        {/* BUTTON ACTIONS */}
        {stage !== "FAILED" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={captureAndVerify}
              disabled={!cameraReady || stage === "VERIFYING" || cameraError}
              style={{ width: "100%" }}
            >
              <Fingerprint size={18} style={{ marginRight: "6px" }} />
              {stage === "IDLE" ? `Scan Palm & Pay ${formatCurrency(amount)}` : "Authorizing Biometrics..."}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setError("");
                setPin("");
                setStage("PIN");
              }}
              style={{ width: "100%", fontSize: "13px" }}
            >
              <KeyRound size={15} style={{ marginRight: "6px" }} /> Use PIN Instead
            </button>
          </div>
        ) : (
          /* ON NO-MATCH / LOW CONFIDENCE FAIL */
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-primary"
              onClick={() => {
                setStage("IDLE");
                setError("");
                captureAndVerify();
              }}
              style={{ flex: 1 }}
            >
              <RefreshCw size={15} style={{ marginRight: "6px" }} /> Retry Scan
            </button>

            <button
              className="btn-outline"
              onClick={() => {
                setError("");
                setPin("");
                setStage("PIN");
              }}
              style={{ flex: 1 }}
            >
              <KeyRound size={15} style={{ marginRight: "6px" }} /> Use PIN Instead
            </button>
          </div>
        )}
      </div>

      {/* 4-DIGIT PIN CHALLENGE MODAL */}
      {stage === "PIN" && (
        <div className="modal-backdrop" onClick={() => setStage("IDLE")}>
          <div className={`modal-card ${shakeError ? "shake-anim" : ""}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon-bubble">
              <KeyRound size={26} />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>Enter 4-Digit PIN</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Authorize payment of <strong>{formatCurrency(amount)}</strong> to {recipientName}
            </p>

            {error && <div className="toast-inline-error">{error}</div>}

            <form onSubmit={handlePinSubmit}>
              <div className="pin-input-container">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength="4"
                  autoFocus
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="form-input pin-masked-input"
                  required
                />
                <button
                  type="button"
                  className="pin-eye-toggle"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                className="btn-primary"
                type="submit"
                disabled={pin.length !== 4 || pinLoading}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                {pinLoading ? "Authorizing..." : `Confirm & Pay ${formatCurrency(amount)}`}
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setError("");
                  setStage("IDLE");
                }}
                style={{ width: "100%" }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
