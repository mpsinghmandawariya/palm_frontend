import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Fingerprint,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  RefreshCw,
  ArrowRight,
  Zap
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SuccessVictoryIllustration } from "../components/Illustrations";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function PayWithPalm() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const webcamRef = useRef(null);

  const initialRecipient = location.state || {
    recipientName: "Nayantara V",
    recipientPhone: "+91 8050530XXX",
    avatar: "👩🏻",
  };

  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState("130.00");
  const [stage, setStage] = useState("keypad"); // 'keypad' | 'scan' | 'verifying' | 'pin' | 'success'
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // PIN Fallback State
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const quickPayees = [
    { recipientName: "Nayantara V", recipientPhone: "+91 8050530XXX", avatar: "👩🏻" },
    { recipientName: "BESCOM Power", recipientPhone: "bill.power@easypay", avatar: "⚡" },
    { recipientName: "Raj K", recipientPhone: "+91 9422019XXX", avatar: "🎩" },
    { recipientName: "Priya S", recipientPhone: "+91 7382910XXX", avatar: "👩🏽" },
  ];

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleKeypadPress = (val) => {
    setError("");
    if (val === "⌫") {
      if (amount.length <= 1) {
        setAmount("0");
      } else {
        setAmount(amount.slice(0, -1));
      }
      return;
    }

    if (val === ".") {
      if (!amount.includes(".")) {
        setAmount(amount + ".");
      }
      return;
    }

    if (amount === "0" || amount === "130.00") {
      setAmount(val);
    } else {
      if (amount.includes(".")) {
        const decimals = amount.split(".")[1];
        if (decimals && decimals.length >= 2) return;
      }
      setAmount(amount + val);
    }
  };

  const startBiometricScan = () => {
    setError("");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid payment amount");
      triggerShake();
      return;
    }
    setStage("scan");
  };

  const captureAndAuthenticate = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("Camera is initializing. Please hold your hand steady.");
      triggerShake();
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError("Unable to capture palm snapshot. Verify lighting and try again.");
      triggerShake();
      return;
    }

    setStage("verifying");

    try {
      const response = await API.post("/payment/pay", {
        amount: Number(amount),
        image,
        recipientName: recipient.recipientName,
        recipientPhone: recipient.recipientPhone,
        category: "Transfer",
      });

      if (response.data?.success) {
        setPayment(response.data.payment);
        toast.success("✓ Palm biometrics authenticated successfully!");
        setStage("success");
      } else {
        throw new Error(response.data?.message || "Biometric match failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      const isPinChallenge = err.response?.data?.action === "PIN_CHALLENGE" || err.response?.status === 401;
      const errMsg = err.response?.data?.message || err.message || "Biometric verification failed.";

      setError(errMsg);
      triggerShake();

      if (isPinChallenge) {
        setPin("");
        setStage("pin");
      } else {
        setStage("scan");
      }
    }
  };

  const authenticateWithPin = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      triggerShake();
      return;
    }

    setError("");
    setPinLoading(true);

    try {
      const response = await API.post("/payment/pay", {
        amount: Number(amount),
        pin,
        recipientName: recipient.recipientName,
        recipientPhone: recipient.recipientPhone,
        category: "Transfer",
      });

      if (response.data?.success) {
        setPayment(response.data.payment);
        toast.success("✓ Payment authorized with Security PIN!");
        setStage("success");
      } else {
        throw new Error(response.data?.message || "PIN verification failed.");
      }
    } catch (err) {
      console.error("PIN payment error:", err);
      setError(err.response?.data?.message || err.message || "Incorrect PIN. Please try again.");
      triggerShake();
    } finally {
      setPinLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // SUCCESS RECEIPT VIEW
  if (stage === "success") {
    return (
      <MobileFrame showBottomNav={false}>
        <div className="receipt-screen">
          <Header
            title="Transfer Receipt"
            subtitle="Transaction Succeeded"
            showBack={true}
            backTo="/dashboard"
          />

          <div className="receipt-celebration-hero">
            <SuccessVictoryIllustration />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Transfer Success</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            Your payment has been sent to {payment?.recipientName || recipient.recipientName}
          </p>

          <div className="receipt-total-block">
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Paid</span>
            <strong style={{ fontSize: "28px", color: "var(--text-primary)" }}>
              {formatCurrency(payment?.amount || amount)}
            </strong>
          </div>

          <div className="receipt-recipient-row">
            <div className="user-avatar-sm" style={{ width: "40px", height: "40px", fontSize: "18px" }}>
              {recipient.avatar || "👤"}
            </div>
            <div className="receipt-recipient-info">
              <h5>{payment?.recipientName || recipient.recipientName}</h5>
              <span>{payment?.recipientPhone || recipient.recipientPhone} • {payment?.authMethod || "Palm Biometrics"}</span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => navigate("/dashboard")} style={{ width: "100%", marginBottom: "12px" }}>
            Done & Return to Dashboard
          </button>

          <button
            className="btn-outline"
            style={{ width: "100%" }}
            onClick={() => {
              setPayment(null);
              setStage("keypad");
            }}
          >
            Transfer more money
          </button>
        </div>
      </MobileFrame>
    );
  }

  // KEYPAD ENTRY SCREEN
  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title="Send Money"
        subtitle="Contactless Palm Checkout"
        showBack={true}
        backTo="/dashboard"
        showMlHealth={true}
      />

      {/* RECIPIENT PROFILE CARD */}
      <div className="recipient-card-box">
        <div className="recipient-avatar-large">{recipient.avatar || "👩🏻"}</div>
        <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{recipient.recipientName}</h3>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{recipient.recipientPhone}</span>
      </div>

      {/* QUICK PAYEES SELECTOR */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        {quickPayees.map((p) => (
          <button
            key={p.recipientName}
            type="button"
            className={`pill-tab ${recipient.recipientName === p.recipientName ? "active" : ""}`}
            onClick={() => setRecipient(p)}
          >
            {p.avatar} {p.recipientName.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* BIG AMOUNT DISPLAY WITH ERROR SHAKE */}
      <div className={`keypad-amount-display ${shakeError ? "shake-anim" : ""}`}>
        ₹{amount}
      </div>

      {error && <div className="toast-inline-error">{error}</div>}

      {/* 3x4 NUMERIC KEYPAD */}
      <div className="numeric-keypad-grid">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((btn) => (
          <button
            key={btn}
            className="keypad-btn"
            onClick={() => handleKeypadPress(btn)}
            aria-label={`Digit ${btn}`}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* ACTIONS */}
      <button className="btn-primary" onClick={startBiometricScan} style={{ width: "100%", marginBottom: "8px" }}>
        <Fingerprint size={18} style={{ marginRight: "6px" }} />
        Send ₹{amount} with Palm Scan
      </button>

      <button
        type="button"
        className="btn-outline"
        onClick={() => {
          setError("");
          setPin("");
          setStage("pin");
        }}
        style={{ width: "100%", fontSize: "13px" }}
      >
        <KeyRound size={15} style={{ marginRight: "6px" }} />
        Pay with 4-Digit Security PIN
      </button>

      {/* BIOMETRIC SCANNER OVERLAY MODAL */}
      {(stage === "scan" || stage === "verifying") && (
        <div className="biometric-scanner-overlay">
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>Palm Authorization</h3>
            <p style={{ fontSize: "13px", opacity: 0.85 }}>
              Transferring <strong>₹{amount}</strong> to {recipient.recipientName}
            </p>
          </div>

          <div className="biometric-camera-box">
            {cameraError ? (
              <div className="camera-error-placeholder">
                <Camera size={36} />
                <p>Camera access denied or unavailable</p>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setCameraError(false);
                    setCameraReady(false);
                  }}
                  style={{ color: "white", borderColor: "white" }}
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
                    setError("Webcam access required for palm biometrics.");
                  }}
                />
                <div className="biometric-laser-line" />
              </>
            )}
          </div>

          {error && <div className="toast-inline-error" style={{ background: "rgba(220,38,38,0.9)", color: "white" }}>{error}</div>}

          {stage === "verifying" ? (
            <div className="verifying-glass-box">
              <div className="spinner" style={{ width: "24px", height: "24px", margin: "0 auto 8px" }} />
              <strong>Matching Palm Biometrics...</strong>
            </div>
          ) : (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn-primary"
                style={{ background: "#ffffff", color: "#111111", width: "100%" }}
                onClick={captureAndAuthenticate}
                disabled={!cameraReady || cameraError}
              >
                <Fingerprint size={18} style={{ marginRight: "6px" }} />
                Capture Palm & Pay ₹{amount}
              </button>

              <button
                type="button"
                className="btn-outline"
                style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.3)", width: "100%" }}
                onClick={() => {
                  setError("");
                  setPin("");
                  setStage("pin");
                }}
              >
                <KeyRound size={15} style={{ marginRight: "6px" }} />
                Use Security PIN Instead
              </button>

              <button
                style={{ background: "transparent", color: "white", fontSize: "14px", padding: "6px" }}
                onClick={() => setStage("keypad")}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4-DIGIT PIN CHALLENGE / FALLBACK MODAL */}
      {stage === "pin" && (
        <div className="modal-backdrop" onClick={() => setStage("keypad")}>
          <div className={`modal-card ${shakeError ? "shake-anim" : ""}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon-bubble">
              <KeyRound size={26} />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>Enter 4-Digit PIN</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Authorize transfer of <strong>₹{amount}</strong> to {recipient.recipientName}
            </p>

            {error && <div className="toast-inline-error" style={{ marginBottom: "14px" }}>{error}</div>}

            <form onSubmit={authenticateWithPin}>
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
                {pinLoading ? "Authorizing..." : `Authorize Payment (₹${amount})`}
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setError("");
                  setStage("keypad");
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