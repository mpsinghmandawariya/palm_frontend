import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { Camera, Upload, X, RefreshCw, Sparkles, CheckCircle2, QrCode } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const toast = useToast();
  const webcamRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(true);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    setScanning(true);
    setCameraError(false);

    const scanFrame = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleQRCodeFound(code.data);
          return;
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOpen]);

  const handleQRCodeFound = (dataString) => {
    try {
      // 1. Try parsing JSON format
      if (dataString.startsWith("{")) {
        const parsed = JSON.parse(dataString);
        if (parsed.phone || parsed.recipientPhone) {
          toast.success("✓ QR Code scanned successfully!");
          onScanSuccess({
            phone: parsed.phone || parsed.recipientPhone,
            name: parsed.name || parsed.recipientName || `User (${parsed.phone})`,
            amount: parsed.amount ? Number(parsed.amount) : null,
          });
          onClose();
          return;
        }
      }

      // 2. Try parsing URL/URI parameters (e.g. palmpay:// or upi:// or https://)
      if (dataString.includes("phone=") || dataString.includes("pa=")) {
        const urlParams = new URLSearchParams(dataString.split("?")[1] || dataString);
        const phone = urlParams.get("phone") || (urlParams.get("pa") || "").split("@")[0];
        const name = urlParams.get("name") || urlParams.get("pn") || "Palm Pay User";
        const amount = urlParams.get("amount") || urlParams.get("am");

        if (phone) {
          toast.success("✓ QR Code scanned successfully!");
          onScanSuccess({
            phone: phone.replace(/\D/g, "").slice(-10),
            name: decodeURIComponent(name),
            amount: amount ? Number(amount) : null,
          });
          onClose();
          return;
        }
      }

      // 3. Fallback to raw string if 10-digit number
      const digits = dataString.replace(/\D/g, "");
      if (digits.length === 10) {
        toast.success("✓ QR Code scanned successfully!");
        onScanSuccess({
          phone: digits,
          name: `User (${digits})`,
          amount: null,
        });
        onClose();
        return;
      }

      toast.error("Unrecognized QR Code format. Please scan a valid Palm Pay QR.");
    } catch (e) {
      console.error("QR Parse error:", e);
      toast.error("Invalid QR Code payload.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQRCodeFound(code.data);
        } else {
          toast.error("No valid QR code found in the uploaded image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Scan QR Code"
        style={{ maxWidth: "360px", textAlign: "center" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <QrCode size={20} />
            <span style={{ fontSize: "15px", fontWeight: "800" }}>Scan Payment QR</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
          Align the Palm Pay QR code within the frame
        </p>

        {/* SCANNER CAMERA BOX */}
        <div className="palm-camera-frame" style={{ height: "220px", margin: "0 auto 14px", position: "relative" }}>
          {cameraError ? (
            <div className="camera-error-placeholder">
              <Camera size={36} />
              <p>Camera access denied</p>
            </div>
          ) : (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onUserMediaError={() => setCameraError(true)}
              />

              {/* SCANNER RETICLE OVERLAY */}
              <div
                style={{
                  position: "absolute",
                  inset: "20px",
                  border: "2px solid var(--color-brand)",
                  borderRadius: "12px",
                  pointerEvents: "none",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                }}
              />
              <div className="biometric-laser-line active" />
            </>
          )}
        </div>

        {/* UPLOAD FILE ALTERNATIVE */}
        <div style={{ marginBottom: "14px" }}>
          <label className="btn-outline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer", width: "100%", padding: "10px" }}>
            <Upload size={15} />
            <span>Upload QR Image from Gallery</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <button type="button" className="btn-outline" onClick={onClose} style={{ width: "100%" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
