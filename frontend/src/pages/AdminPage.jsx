import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await API.get("/admin/metrics");
        setData(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdmin();
  }, []);

  const metrics = data?.metrics;

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Admin Dashboard
      </button>

      <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
        <h2 style={{ fontSize: "20px" }}>System Management</h2>
        <p style={{ color: "#767676", fontSize: "13px" }}>Platform metrics & Fraud monitoring</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #ece7df", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#767676" }}>Total Users</span>
          <h3 style={{ fontSize: "24px", margin: "2px 0" }}>{metrics?.totalUsers || 1}</h3>
        </div>
        <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #ece7df", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#767676" }}>Transactions</span>
          <h3 style={{ fontSize: "24px", margin: "2px 0" }}>{metrics?.totalTransactions || 0}</h3>
        </div>
        <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #ece7df", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#767676" }}>Palm Templates</span>
          <h3 style={{ fontSize: "24px", margin: "2px 0" }}>{metrics?.palmProfiles || 0}</h3>
        </div>
        <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #ece7df", textAlign: "center" }}>
          <span style={{ fontSize: "11px", color: "#767676" }}>Fraud Alerts</span>
          <h3 style={{ fontSize: "24px", margin: "2px 0", color: "#16a34a" }}>{metrics?.activeFraudAlerts || 0}</h3>
        </div>
      </div>
    </MobileFrame>
  );
}
