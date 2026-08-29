import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function PalmRegister() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const capturePalm = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("Camera is not ready. Please verify webcam permissions.");
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      setError("Unable to capture palm snapshot. Please try again.");
      return;
    }

    setScanning(true);

    try {
      const response = await API.post("/palm/register", { image });

      if (response.data?.success) {
        setSuccess(true);
      } else {
        throw new Error(response.data?.message || "Biometric registration failed.");
      }
    } catch (err) {
      console.error("Palm registration error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Palm registration failed. Please ensure your hand is steady and well-lit."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      {!success ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f8f6f2", border: "2px solid #ece7df", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 14px" }}>
            🖐
          </div>

          <h2 style={{ fontSize: "22px", marginBottom: "6px" }}>Register Palm ID</h2>
          <p style={{ color: "#767676", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
            Position your open palm inside the round frame to generate your biometric encryption vector.
          </p>

          <div style={{
            position: "relative",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            overflow: "hidden",
            margin: "0 auto 20px",
            border: "3px dashed #111111",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
          }}>
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
            {scanning && <div className="biometric-laser-line" />}
          </div>

          <div style={{ fontSize: "12px", color: cameraReady ? "#16a34a" : "#767676", fontWeight: "700", marginBottom: "20px" }}>
            {cameraReady ? "● Sensor Active & Ready" : "○ Initializing Sensor..."}
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button
            className="btn-black"
            onClick={capturePalm}
            disabled={!cameraReady || scanning}
            style={{ marginBottom: "12px" }}
          >
            {scanning ? "Extracting Palm Vector..." : "Capture & Register Palm"}
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/dashboard")}
            disabled={scanning}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 10px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", fontSize: "36px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontWeight: "bold" }}>
            ✓
          </div>

          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Palm ID Active!</h2>
          <p style={{ color: "#767676", fontSize: "14px", lineHeight: "1.5", marginBottom: "28px" }}>
            Your biometric palm vector has been linked with your EasyPay wallet. You can now pay anywhere with your palm.
          </p>

          <button className="btn-black" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      )}
    </MobileFrame>
  );
}