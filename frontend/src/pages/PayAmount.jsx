import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  User,
  Store,
  Coffee,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Search,
  QrCode,
  Camera
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import QRScannerModal from "../components/QRScannerModal";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function PayAmount() {
  const navigate = useNavigate();
  const toast = useToast();

  const [payMode, setPayMode] = useState("MOBILE"); // 'MOBILE' | 'MERCHANT'
  const [amount, setAmount] = useState("250");
  const [mobileNumber, setMobileNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [lookupUser, setLookupUser] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const quickRecipients = [
    { name: "Starbucks Coffee", icon: <Coffee size={14} />, category: "Merchant" },
    { name: "Rahul Sharma", icon: <User size={14} />, phone: "9876543210", category: "P2P" },
    { name: "Palm Pay Store", icon: <Store size={14} />, category: "Merchant" },
    { name: "Blue Tokai Roasters", icon: <Coffee size={14} />, category: "Merchant" },
  ];

  // Automatic Lookup when 10-digit phone is entered
  useEffect(() => {
    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      setLookupLoading(true);
      API.get(`/payment/lookup/${cleanPhone}`)
        .then((res) => {
          if (res.data?.success && res.data.user) {
            setLookupUser(res.data.user);
            setRecipientName(res.data.user.name);
          } else {
            setLookupUser(null);
            setRecipientName(`User (${cleanPhone})`);
          }
        })
        .catch(() => {
          setLookupUser(null);
          setRecipientName(`User (${cleanPhone})`);
        })
        .finally(() => setLookupLoading(false));
    } else {
      setLookupUser(null);
    }
  }, [mobileNumber]);

  const handleQRScanSuccess = (scanData) => {
    if (scanData.phone) {
      setPayMode("MOBILE");
      setMobileNumber(scanData.phone);
      if (scanData.name) {
        setRecipientName(scanData.name);
      }
      if (scanData.amount && scanData.amount > 0) {
        setAmount(String(scanData.amount));
      }
      toast.success(`Scanned payment details for ${scanData.name || scanData.phone}!`);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    let finalRecipient = recipientName.trim();
    let finalPhone = null;

    if (payMode === "MOBILE") {
      const cleanPhone = mobileNumber.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      finalPhone = cleanPhone;
      finalRecipient = lookupUser ? `${lookupUser.name} (${cleanPhone})` : `Mobile: ${cleanPhone}`;
    } else {
      if (!finalRecipient) {
        toast.error("Please enter a merchant or payee name");
        return;
      }
    }

    navigate("/pay/scan", {
      state: {
        amount: numAmount,
        recipientName: finalRecipient,
        recipientPhone: finalPhone,
      },
    });
  };

  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title="Pay with Palm"
        subtitle="Step 1 of 2: Enter Amount & Payee"
        showBack={true}
        backTo="/dashboard"
        rightActions={
          <button
            className="btn-icon"
            onClick={() => setShowQRScanner(true)}
            aria-label="Scan QR Code"
            title="Scan Payment QR"
          >
            <Camera size={18} />
          </button>
        }
      />

      {/* QUICK SCAN QR BANNER */}
      <div
        className="enterprise-card-box"
        onClick={() => setShowQRScanner(true)}
        style={{
          cursor: "pointer",
          margin: "8px 0 10px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="icon-badge-round" style={{ width: "36px", height: "36px", background: "var(--color-accent-blue)", color: "#0284c7" }}>
            <QrCode size={18} />
          </div>
          <div>
            <strong style={{ fontSize: "13px", display: "block" }}>Scan QR Code</strong>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Scan Palm Pay or UPI QR to auto-fill</span>
          </div>
        </div>
        <ArrowRight size={16} className="text-muted" />
      </div>

      {/* PAY MODE SELECTOR TABS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "4px 0 12px" }}>
        <button
          type="button"
          className={`pill-tab ${payMode === "MOBILE" ? "active" : ""}`}
          onClick={() => {
            setPayMode("MOBILE");
            setRecipientName("");
          }}
          style={{ justifyContent: "center", padding: "10px", fontWeight: "700" }}
        >
          <Phone size={15} style={{ marginRight: "6px" }} /> Pay by Mobile
        </button>

        <button
          type="button"
          className={`pill-tab ${payMode === "MERCHANT" ? "active" : ""}`}
          onClick={() => {
            setPayMode("MERCHANT");
            setRecipientName("Starbucks Coffee");
          }}
          style={{ justifyContent: "center", padding: "10px", fontWeight: "700" }}
        >
          <Store size={15} style={{ marginRight: "6px" }} /> Pay Merchant
        </button>
      </div>

      <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* AMOUNT ENTRY CARD */}
        <div className="enterprise-card-box" style={{ textAlign: "center", padding: "18px 16px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
            Payment Amount
          </span>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0" }}>
            <span style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-muted)", marginRight: "4px" }}>₹</span>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              style={{
                fontSize: "36px",
                fontWeight: "800",
                textAlign: "center",
                width: "200px",
                padding: "4px 8px",
                border: "none",
                background: "transparent",
              }}
              required
              autoFocus
            />
          </div>

          <div className="quick-amount-selector" style={{ margin: "6px 0 0" }}>
            {["100", "250", "500", "1000"].map((amt) => (
              <button
                key={amt}
                type="button"
                className={`amount-pill-btn ${amount === amt ? "active" : ""}`}
                onClick={() => setAmount(amt)}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* RECIPIENT INPUT ACCORDING TO PAY MODE */}
        {payMode === "MOBILE" ? (
          <div>
            <label className="input-label">Recipient Mobile Number</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-leading-icon" />
              <input
                type="tel"
                maxLength="10"
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "38px" }}
                required
              />
            </div>

            {/* LIVE VERIFIED RECIPIENT CARD */}
            {lookupLoading ? (
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Verifying account...
              </div>
            ) : lookupUser ? (
              <div
                className="enterprise-card-box"
                style={{
                  background: "var(--color-accent-green)",
                  borderColor: "rgba(22, 163, 74, 0.3)",
                  padding: "8px 12px",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-success)" }}>
                  Verified Account: {lookupUser.name}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <label className="input-label">Merchant / Store Name</label>
            <div className="input-with-icon">
              <Store size={16} className="input-leading-icon" />
              <input
                type="text"
                placeholder="e.g. Starbucks, Blue Tokai, Store"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "38px" }}
                required
              />
            </div>
          </div>
        )}

        {/* QUICK SUGGESTIONS */}
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", display: "block", marginBottom: "8px" }}>
            Quick Suggestions
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {quickRecipients.map((q) => (
              <button
                key={q.name}
                type="button"
                className="pill-tab"
                onClick={() => {
                  if (q.phone) {
                    setPayMode("MOBILE");
                    setMobileNumber(q.phone);
                    setRecipientName(q.name);
                  } else {
                    setPayMode("MERCHANT");
                    setRecipientName(q.name);
                  }
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                {q.icon} {q.name}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          type="submit"
          style={{ width: "100%", marginTop: "8px" }}
        >
          Continue to Palm Scan <ArrowRight size={16} style={{ marginLeft: "6px" }} />
        </button>

        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate("/dashboard")}
          style={{ width: "100%" }}
        >
          Cancel
        </button>
      </form>

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </MobileFrame>
  );
}
