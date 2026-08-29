import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function MerchantPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await API.get("/merchant");
        setData(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMerchant();
  }, []);

  const merchant = data?.merchant;

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Merchant System
      </button>

      <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#111111", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 10px" }}>
          🏪
        </div>
        <h2 style={{ fontSize: "20px" }}>{merchant?.businessName || "Merchant Store"}</h2>
        <span style={{ color: "#767676", fontSize: "13px" }}>POS Terminal & Settlements</span>
      </div>

      <div style={{ background: "white", borderRadius: "20px", padding: "20px", border: "1.5px solid #ece7df", marginBottom: "16px", textAlign: "center" }}>
        <span style={{ fontSize: "12px", color: "#767676", textTransform: "uppercase" }}>Total Sales Volume</span>
        <h1 style={{ fontSize: "32px", color: "#111111", margin: "4px 0 12px" }}>₹{merchant?.totalSalesVolume?.toLocaleString("en-IN") || "12,450.00"}</h1>
        <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>✓ Bank Settlements Active ({merchant?.settlementAccount})</div>
      </div>

      <div className="tx-compact-item" style={{ cursor: "default" }}>
        <div className="tx-compact-left">
          <div className="tx-avatar">🔲</div>
          <div className="tx-compact-info">
            <h5>Merchant POS QR Code</h5>
            <span>{merchant?.merchantQrCode}</span>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
