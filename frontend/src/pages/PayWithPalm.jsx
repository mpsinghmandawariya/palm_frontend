import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import MobileFrame from "../components/MobileFrame";
import { SuccessVictoryIllustration } from "../components/Illustrations";
import API from "../services/api";

export default function PayWithPalm() {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);

  // Dynamic recipient passed via navigation or defaulted
  const initialRecipient = location.state || {
    recipientName: "Nayantara V",
    recipientPhone: "+91 8050530XXX",
    avatar: "👩🏻",
  };

  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState("130.00");
  const [stage, setStage] = useState("keypad"); // 'keypad' | 'scan' | 'verifying' | 'success'
  const [cameraReady, setCameraReady] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  // Payee Quick Selector
  const quickPayees = [
    { recipientName: "Nayantara V", recipientPhone: "+91 8050530XXX", avatar: "👩🏻" },
    { recipientName: "Raj K", recipientPhone: "+91 9422019XXX", avatar: "🎩" },
    { recipientName: "Priya S", recipientPhone: "+91 7382910XXX", avatar: "👩🏽" },
    { recipientName: "Electricity Board", recipientPhone: "bill.power@easypay", avatar: "⚡" },
  ];

  // Handle 3x4 Numeric Keypad Taps
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
      return;
    }
    setStage("scan");
  };

  const captureAndAuthenticate = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("Camera is initializing. Please wait a moment.");
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError("Unable to capture palm scan. Please ensure camera permissions are active.");
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
        setStage("success");
      } else {
        throw new Error(response.data?.message || "Biometric match failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Biometric verification failed. Please align your palm and retry."
      );
      setStage("scan");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // =========================================
  // SCREEN 4: TRANSFER SUCCESS RECEIPT
  // =========================================
  if (stage === "success") {
    return (
      <MobileFrame showBottomNav={false}>
        <div className="receipt-screen">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
              ← Transfer Receipt
            </button>
          </div>

          <div className="receipt-celebration-hero">
            <SuccessVictoryIllustration />
          </div>

          <h2>Transfer Success</h2>
          <p>Your money has been successfully sent to {payment?.recipientName || recipient.recipientName}</p>

          <div className="receipt-total-block">
            <span>Total Transfer</span>
            <strong>{formatCurrency(payment?.amount || amount)}</strong>
          </div>

          <div style={{ textAlign: "left", marginBottom: "6px", fontSize: "12px", color: "#767676", textTransform: "uppercase", fontWeight: "700" }}>
            Recipient
          </div>
          <div className="receipt-recipient-row">
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {recipient.avatar || "👤"}
            </div>
            <div className="receipt-recipient-info">
              <h5>{payment?.recipientName || recipient.recipientName}</h5>
              <span>{payment?.recipientPhone || recipient.recipientPhone} • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          <button className="btn-black" onClick={() => navigate("/dashboard")} style={{ marginBottom: "12px" }}>
            Done
          </button>

          <button
            style={{ background: "transparent", color: "#111111", fontSize: "14px", fontWeight: "700" }}
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

  // =========================================
  // SCREEN 3: SEND MONEY & KEYPAD ENTRY
  // =========================================
  return (
    <MobileFrame showBottomNav={false}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
          ← Send Money
        </button>
        <span style={{ fontSize: "18px", cursor: "pointer" }}>🔍</span>
      </div>

      {/* RECIPIENT PROFILE */}
      <div className="recipient-card-box">
        <div className="recipient-avatar-large">{recipient.avatar || "👩🏻"}</div>
        <h3>{recipient.recipientName}</h3>
        <span>{recipient.recipientPhone}</span>
      </div>

      {/* QUICK PAYEE SWITCHER */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
        {quickPayees.map((p) => (
          <button
            key={p.recipientName}
            type="button"
            onClick={() => setRecipient(p)}
            style={{
              padding: "5px 10px",
              borderRadius: "14px",
              fontSize: "12px",
              background: recipient.recipientName === p.recipientName ? "#111111" : "#f8f6f2",
              color: recipient.recipientName === p.recipientName ? "#ffffff" : "#111111",
              border: "1px solid #ece7df",
            }}
          >
            {p.avatar} {p.recipientName.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* DYNAMIC BIG AMOUNT DISPLAY */}
      <div className="keypad-amount-display">
        ₹{amount}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* 3x4 NUMERIC KEYPAD */}
      <div className="numeric-keypad-grid">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((btn) => (
          <button
            key={btn}
            className="keypad-btn"
            onClick={() => handleKeypadPress(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* SEND BUTTON */}
      <button className="btn-black" onClick={startBiometricScan}>
        🖐 Send ₹{amount} with Palm Verification
      </button>

      {/* BIOMETRIC SCANNER POPUP MODAL */}
      {(stage === "scan" || stage === "verifying") && (
        <div className="biometric-scanner-overlay">
          <div>
            <h3 style={{ fontSize: "20px", marginBottom: "4px" }}>Palm Authorization</h3>
            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              Transferring <strong>₹{amount}</strong> to {recipient.recipientName}
            </p>
          </div>

          <div className="biometric-camera-box">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.9}
              mirrored={true}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => setError("Camera access denied or unavailable.")}
            />
            <div className="biometric-laser-line" />
          </div>

          {error && <div className="error-banner" style={{ background: "#991b1b", color: "white", borderColor: "#dc2626" }}>{error}</div>}

          {stage === "verifying" ? (
            <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", width: "100%" }}>
              <div className="spinner" style={{ width: "24px", height: "24px", margin: "0 auto 8px" }} />
              <strong>Matching Palm Biometrics...</strong>
            </div>
          ) : (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="btn-black"
                style={{ background: "#ffffff", color: "#111111" }}
                onClick={captureAndAuthenticate}
                disabled={!cameraReady}
              >
                Capture Palm & Pay ₹{amount}
              </button>

              <button
                style={{ background: "transparent", color: "white", fontSize: "14px", padding: "8px" }}
                onClick={() => setStage("keypad")}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </MobileFrame>
  );
}