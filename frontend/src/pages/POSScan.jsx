import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import {
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Sparkles,
  UserCheck,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function POSScan() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const webcamRef = useRef(null);

  const session = location.state || {
    sessionId: "demo-pos-session",
    amount: 150,
    merchantName: "Starbucks Coffee (Counter 1)",
  };

  const [stage, setStage] = useState("IDLE"); // 'IDLE' | 'DETECTING' | 'PALM_DETECTED' | 'IDENTIFYING' | 'IDENTIFIED'
  const [statusMessage, setStatusMessage] = useState("Waiting for customer...");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [identifiedCustomer, setIdentifiedCustomer] = useState(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState("");

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const captureAndIdentify = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("POS camera is initializing. Please wait...");
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError("Unable to capture palm frame. Ensure good lighting.");
      return;
    }

    try {
      // 1. Detecting
      setStage("DETECTING");
      setStatusMessage("Looking for customer's palm...");
      await new Promise((r) => setTimeout(r, 400));

      // 2. Palm detected
      setStage("PALM_DETECTED");
      setStatusMessage("Palm detected ✓");
      await new Promise((r) => setTimeout(r, 350));

      // 3. 1:N Biometric Identification Search
      setStage("IDENTIFYING");
      setStatusMessage("Identifying customer (1:N search)...");

      const response = await API.post("/pos/identify", {
        sessionId: session.sessionId,
        image,
      });

      if (response.data?.success) {
        setIdentifiedCustomer(response.data);
        setStage("IDENTIFIED");
        setStatusMessage("Customer identified ✓");
        toast.success(`✓ Customer identified: ${response.data.customerName} (${response.data.matchScore}% Match)`);
      } else {
        throw new Error(response.data?.message || "No matching customer found.");
      }
    } catch (err) {
      console.error("POS identification error:", err);
      setStage("IDLE");
      setStatusMessage("Waiting for customer...");
      setError(
        err.response?.data?.message ||
        "Biometric identification failed. No matching palm profile found. Ensure palm is registered."
      );
      toast.error("No matching customer found.");
    }
  };

  const handleAuthorizePayment = async () => {
    setAuthorizing(true);
    setError("");

    try {
      const response = await API.post("/pos/authorize", {
        sessionId: session.sessionId,
        customerId: identifiedCustomer?.customerId,
      });

      if (response.data?.success) {
        toast.success("✓ Payment authorized at POS terminal!");
        navigate("/pos/receipt", {
          state: {
            receipt: response.data,
            merchantName: session.merchantName,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment authorization failed");
      toast.error("Payment authorization failed");
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title="POS Terminal Scanner"
        subtitle={`Amount: ${formatCurrency(session.amount)}`}
        showBack={true}
        backTo="/pos"
        showMlHealth={true}
      />

      {stage !== "IDENTIFIED" ? (
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "2px" }}>
            👋 SCAN PALM
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
            {statusMessage}
          </p>

          {/* LIVE CAMERA SCANNER */}
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
                    setError("Webcam sensor access required for POS scanning.");
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
                {(stage === "DETECTING" || stage === "IDENTIFYING") && (
                  <div className="biometric-laser-line active" />
                )}
              </>
            )}
          </div>

          <div style={{ margin: "14px 0 16px" }}>
            {stage === "IDENTIFYING" || stage === "DETECTING" || stage === "PALM_DETECTED" ? (
              <span className="badge-pill badge-neutral" style={{ padding: "6px 14px", fontSize: "13px" }}>
                <Sparkles size={14} style={{ marginRight: "6px" }} /> {statusMessage}
              </span>
            ) : (
              <div className="sensor-status-indicator">
                <span className={`status-dot ${cameraReady ? "green" : "gray"}`} />
                <span>{cameraReady ? "POS Optical Sensor Ready" : "Initializing Camera..."}</span>
              </div>
            )}
          </div>

          {error && <div className="toast-inline-error">{error}</div>}

          <button
            className="btn-primary"
            onClick={captureAndIdentify}
            disabled={!cameraReady || stage === "IDENTIFYING" || cameraError}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Fingerprint size={18} style={{ marginRight: "6px" }} />
            {stage === "IDLE" ? "Scan Customer's Palm" : "Identifying Customer..."}
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/pos")}
            style={{ width: "100%" }}
          >
            Cancel POS Session
          </button>
        </div>
      ) : (
        /* CUSTOMER CONFIRMATION + AUTHORIZE SCREEN (SECTION 3.2) */
        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div className="icon-badge-round" style={{ width: "64px", height: "64px", background: "var(--accent-green)", color: "var(--color-success)", margin: "0 auto 12px" }}>
            <UserCheck size={34} />
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>
            Customer Identified
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
            1:N Biometric Search Match Confirmed
          </p>

          <div className="enterprise-card-box" style={{ textAlign: "left", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Identified Customer</span>
              <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                {identifiedCustomer?.customerName}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Match Confidence</span>
              <span className="badge-pill badge-success" style={{ fontSize: "11px" }}>
                {identifiedCustomer?.matchScore}% Match
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Due</span>
              <strong style={{ fontSize: "20px", color: "var(--text-primary)" }}>
                {formatCurrency(session.amount)}
              </strong>
            </div>
          </div>

          {error && <div className="toast-inline-error">{error}</div>}

          <button
            className="btn-primary"
            onClick={handleAuthorizePayment}
            disabled={authorizing}
            style={{ width: "100%", padding: "14px", marginBottom: "10px" }}
          >
            <ShieldCheck size={18} style={{ marginRight: "6px" }} />
            {authorizing ? "Authorizing Payment..." : `Authorize Payment (${formatCurrency(session.amount)})`}
          </button>

          <button
            className="btn-outline"
            onClick={() => {
              setStage("IDLE");
              setIdentifiedCustomer(null);
            }}
            disabled={authorizing}
            style={{ width: "100%" }}
          >
            Cancel / Re-scan
          </button>
        </div>
      )}
    </MobileFrame>
  );
}
