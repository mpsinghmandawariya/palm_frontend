import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profile");
      setUser(response.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");
    navigate("/");
  };

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Profile
      </button>

      <div style={{ textAlign: "center", margin: "16px 0 24px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#111111", color: "white", fontSize: "28px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          {user?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
        <h2 style={{ fontSize: "20px" }}>{user?.name || "Samantha"}</h2>
        <span style={{ color: "#767676", fontSize: "13px" }}>{user?.mobile || "+91 9876543210"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "26px" }}>
        <div className="tx-compact-item" style={{ cursor: "default" }}>
          <div className="tx-compact-info">
            <span style={{ color: "#767676", fontSize: "11px" }}>Email</span>
            <h5>{user?.email}</h5>
          </div>
        </div>

        <div className="tx-compact-item" style={{ cursor: "default" }}>
          <div className="tx-compact-info">
            <span style={{ color: "#767676", fontSize: "11px" }}>Wallet Balance</span>
            <h5>₹{Number(user?.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
          </div>
        </div>

        <div className="tx-compact-item" onClick={() => navigate("/palm-register")}>
          <div className="tx-compact-left">
            <div className="tx-avatar">🖐</div>
            <div className="tx-compact-info">
              <h5>Palm Biometrics</h5>
              <span>{user?.palmRegistered ? "Active • Ready for checkout" : "Not Registered"}</span>
            </div>
          </div>
          <span style={{ color: "#111111", fontSize: "12px", fontWeight: "700" }}>
            {user?.palmRegistered ? "Re-scan" : "Setup"} →
          </span>
        </div>
      </div>

      <button className="btn-outline" onClick={logout}>
        Log Out
      </button>
    </MobileFrame>
  );
}