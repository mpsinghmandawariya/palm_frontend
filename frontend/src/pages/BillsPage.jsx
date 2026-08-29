import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function BillsPage() {
  const navigate = useNavigate();
  const [billers, setBillers] = useState([]);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [consumerNo, setConsumerNo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBillers = async () => {
      try {
        const response = await API.get("/bills");
        setBillers(response.data.billers || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBillers();
  }, []);

  const handlePayBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/bills/pay", {
        billerId: selectedBiller.name,
        consumerNumber: consumerNo,
        amount: Number(amount),
        category: selectedBiller.category,
      });

      if (response.data.success) {
        setMessage(`✓ Payment Successful! ₹${amount} paid for ${selectedBiller.name}`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Bill payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Bills & Utilities
      </button>

      <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
        <h2 style={{ fontSize: "20px" }}>Utility Payments</h2>
        <p style={{ color: "#767676", fontSize: "13px" }}>Pay electricity, water, mobile & broadband bills</p>
      </div>

      {message && (
        <div className="error-banner" style={{ background: message.includes("✓") ? "#dcfce7" : "#fee2e2", color: message.includes("✓") ? "#16a34a" : "#991b1b" }}>
          {message}
        </div>
      )}

      {!selectedBiller ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {billers.map((b) => (
            <div
              key={b.billerId || b.name}
              onClick={() => {
                setSelectedBiller(b);
                setConsumerNo(b.sampleConsumerNumber || "1009283741");
                setAmount("450");
              }}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "16px",
                border: "1.5px solid #ece7df",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{b.icon || "⚡"}</div>
              <strong style={{ fontSize: "13px", display: "block" }}>{b.name}</strong>
              <span style={{ fontSize: "11px", color: "#767676" }}>{b.category}</span>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handlePayBill} style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1.5px solid #ece7df" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "32px" }}>{selectedBiller.icon}</div>
            <h3>{selectedBiller.name}</h3>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="input-label">Consumer / Account ID</label>
            <input
              type="text"
              value={consumerNo}
              onChange={(e) => setConsumerNo(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="input-label">Bill Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button className="btn-black" type="submit" disabled={loading} style={{ marginBottom: "10px" }}>
            {loading ? "Processing Payment..." : `Pay ₹${amount}`}
          </button>

          <button type="button" className="btn-outline" onClick={() => setSelectedBiller(null)}>
            Select Different Biller
          </button>
        </form>
      )}
    </MobileFrame>
  );
}
