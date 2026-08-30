import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Smartphone,
  Droplets,
  Tv,
  Wifi,
  Car,
  Home,
  CheckCircle2,
  Receipt,
  Search,
  ArrowRight
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function BillsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [billers, setBillers] = useState([]);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [consumerNo, setConsumerNo] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getBillerIcon = (category) => {
    switch (category) {
      case "Mobile": return <Smartphone size={22} color="#0284c7" />;
      case "Electricity": return <Zap size={22} color="#f59e0b" />;
      case "Water": return <Droplets size={22} color="#06b6d4" />;
      case "DTH": return <Tv size={22} color="#8b5cf6" />;
      case "Broadband": return <Wifi size={22} color="#10b981" />;
      case "FASTag": return <Car size={22} color="#ec4899" />;
      default: return <Home size={22} color="#64748b" />;
    }
  };

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

    try {
      const response = await API.post("/bills/pay", {
        billerId: selectedBiller.name,
        consumerNumber: consumerNo,
        amount: Number(amount),
        category: selectedBiller.category,
      });

      if (response.data?.success) {
        toast.success(`✓ Paid ₹${amount} for ${selectedBiller.name}!`);
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Bill payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBillers = billers.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Bills & Utilities"
        subtitle="Instant BBPS Utility Payments"
        showBack={true}
        backTo="/dashboard"
      />

      {!selectedBiller ? (
        <div style={{ marginTop: "14px" }}>
          <div className="search-input-wrapper" style={{ marginBottom: "16px" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search billers (BESCOM, Jio, Airtel...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "38px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {filteredBillers.map((b) => (
              <div
                key={b.billerId || b.name}
                onClick={() => {
                  setSelectedBiller(b);
                  setConsumerNo(b.sampleConsumerNumber || "1009283741");
                  setAmount("450");
                }}
                className="biller-card-btn"
                role="button"
                tabIndex={0}
              >
                <div className="biller-icon-box">
                  {getBillerIcon(b.category)}
                </div>
                <strong style={{ fontSize: "13px", display: "block", color: "var(--text-primary)" }}>{b.name}</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{b.category}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handlePayBill} className="enterprise-card-box" style={{ marginTop: "16px" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div className="icon-badge-round" style={{ width: "54px", height: "54px", margin: "0 auto 8px" }}>
              {getBillerIcon(selectedBiller.category)}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{selectedBiller.name}</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{selectedBiller.category} Provider</span>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label className="input-label">Consumer / Account ID</label>
            <input
              type="text"
              value={consumerNo}
              onChange={(e) => setConsumerNo(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label className="input-label">Bill Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              style={{ fontSize: "20px", fontWeight: "800" }}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginBottom: "10px" }}>
            {loading ? "Processing Payment..." : `Pay ₹${amount}`}
          </button>

          <button type="button" className="btn-outline" onClick={() => setSelectedBiller(null)} style={{ width: "100%" }}>
            Select Different Biller
          </button>
        </form>
      )}
    </MobileFrame>
  );
}
