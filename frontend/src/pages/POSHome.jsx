import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Fingerprint, ArrowRight, ArrowLeft, Sun, Moon } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function POSHome() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [amount, setAmount] = useState("150");
  const [merchantName, setMerchantName] = useState("Starbucks Coffee (Counter 1)");
  const [loading, setLoading] = useState(false);

  const handleRequestScan = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid bill amount");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/pos/session", {
        amount: numAmount,
        merchantName,
      });

      if (res.data?.success) {
        navigate("/pos/scan", {
          state: {
            sessionId: res.data.sessionId,
            amount: res.data.amount,
            merchantName: res.data.merchantName,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initialize POS session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      {/* POS HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <button className="btn-link" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} style={{ marginRight: "4px" }} /> Return to Wallet
        </button>
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div style={{ textAlign: "center", margin: "6px 0 18px" }}>
        <div className="icon-badge-round" style={{ width: "52px", height: "52px", background: "var(--accent-purple)", color: "#9333ea", margin: "0 auto 8px" }}>
          <Store size={26} />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "800" }}>PALM PAY POS</h2>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Merchant: <strong>{merchantName}</strong>
        </span>
      </div>

      {/* POS EXPLANATION CALLOUT */}
      <div className="enterprise-card-box" style={{ background: "var(--bg-subtle)", padding: "12px 14px", marginBottom: "16px" }}>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
          <strong>1:N Biometric Identification:</strong> The customer does not log in here. When their palm is scanned, the system searches all registered templates to identify them and process the payment.
        </p>
      </div>

      <form onSubmit={handleRequestScan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* AMOUNT ENTRY */}
        <div className="enterprise-card-box" style={{ textAlign: "center", padding: "24px 16px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
            Total Sale Amount
          </span>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "10px 0" }}>
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

          <div className="quick-amount-selector" style={{ margin: "10px 0 0" }}>
            {["100", "150", "250", "500"].map((amt) => (
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

        <div>
          <label className="input-label">POS Terminal Location</label>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "14px", marginTop: "8px" }}
        >
          <Fingerprint size={18} style={{ marginRight: "6px" }} />
          {loading ? "Preparing POS Terminal..." : "Request Palm Scan →"}
        </button>
      </form>
    </MobileFrame>
  );
}
