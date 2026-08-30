import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Share2,
  ShieldCheck,
  User,
  Sparkles
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function ReceiveQRModal({ isOpen, onClose, user }) {
  const toast = useToast();
  const [qrUrl, setQrUrl] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const phone = user?.phone || "9876543210";
  const name = user?.name || "Palm Pay User";
  const avatar = user?.avatar || "";

  // Generate QR Code dynamically on user or amount changes
  useEffect(() => {
    if (!isOpen) return;

    const amt = Number(requestedAmount);
    // Standard Palm Pay payment URI payload
    const payload = JSON.stringify({
      type: "PALMPAY_PAYMENT",
      phone: phone,
      name: name,
      amount: amt > 0 ? amt : null,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("QR Generation error:", err));
  }, [isOpen, phone, name, requestedAmount]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const amt = Number(requestedAmount);
    const link = `https://palmpay.internal/pay?phone=${phone}${amt > 0 ? `&amount=${amt}` : ""}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Payment link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `PalmPay_QR_${phone}.png`;
    a.click();
    toast.success("QR Code downloaded!");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Receive Money QR Code"
        style={{ maxWidth: "360px", textAlign: "center" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="brand-logo-badge" style={{ width: "32px", height: "32px" }}>
              <span>🖐</span>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "800" }}>Receive Money</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* USER PROFILE HEADER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "8px 0 14px" }}>
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border-medium)",
                marginBottom: "8px",
              }}
            />
          ) : (
            <div
              className="user-initial-bubble"
              style={{ width: "56px", height: "56px", fontSize: "22px", margin: "0 auto 8px" }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 style={{ fontSize: "17px", fontWeight: "800", margin: 0 }}>{name}</h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            +91 {phone}
          </span>
          <div className="biometric-status-chip active" style={{ marginTop: "6px" }}>
            <ShieldCheck size={12} />
            <span>Verified Palm Pay Account</span>
          </div>
        </div>

        {/* QR CODE DISPLAY BOX */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            display: "inline-block",
            margin: "0 auto 14px",
          }}
        >
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Receive Money QR Code"
              style={{ width: "200px", height: "200px", display: "block" }}
            />
          ) : (
            <div style={{ width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode size={48} color="#64748b" />
            </div>
          )}
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", display: "block", marginTop: "6px" }}>
            Scan with any Palm Pay scanner
          </span>
        </div>

        {/* OPTIONAL AMOUNT SETTER */}
        <div style={{ marginBottom: "14px", textAlign: "left" }}>
          <label className="input-label" style={{ fontSize: "11px" }}>Set Specific Amount (Optional)</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="number"
              min="1"
              placeholder="e.g. 500"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              className="form-input"
              style={{ padding: "8px 12px", fontSize: "14px" }}
            />
            {requestedAmount && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => setRequestedAmount("")}
                style={{ padding: "8px 12px", fontSize: "12px" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button className="btn-primary" onClick={handleDownload} style={{ padding: "10px" }}>
            <Download size={15} style={{ marginRight: "6px" }} /> Download
          </button>

          <button className="btn-outline" onClick={handleCopy} style={{ padding: "10px" }}>
            {copied ? <Check size={15} style={{ marginRight: "6px" }} /> : <Copy size={15} style={{ marginRight: "6px" }} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
