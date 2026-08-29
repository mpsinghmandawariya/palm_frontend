import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function SavingsRewardsPage() {
  const navigate = useNavigate();
  const [savings, setSavings] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activeTab, setActiveTab] = useState("SAVINGS");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await API.get("/savings-rewards/savings");
        setSavings(sRes.data.goals || []);
        const rRes = await API.get("/savings-rewards/rewards");
        setRewards(rRes.data.rewards || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleReveal = async (id) => {
    try {
      const res = await API.post(`/savings-rewards/rewards/${id}/reveal`);
      setRewards((prev) => prev.map((r) => (r._id === id ? res.data.reward : r)));
    } catch (err) {
      alert("Unable to scratch card");
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Savings & Rewards
      </button>

      <div style={{ display: "flex", gap: "10px", margin: "10px 0 16px" }}>
        <button
          className={activeTab === "SAVINGS" ? "btn-black" : "btn-outline"}
          style={{ flex: 1, padding: "10px", fontSize: "13px" }}
          onClick={() => setActiveTab("SAVINGS")}
        >
          🎯 Savings Goals
        </button>
        <button
          className={activeTab === "REWARDS" ? "btn-black" : "btn-outline"}
          style={{ flex: 1, padding: "10px", fontSize: "13px" }}
          onClick={() => setActiveTab("REWARDS")}
        >
          🎁 Rewards & Scratch
        </button>
      </div>

      {activeTab === "SAVINGS" ? (
        <div>
          {savings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "#767676" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎯</div>
              <p>No active savings goals. Create one to start saving!</p>
            </div>
          ) : (
            savings.map((g) => (
              <div key={g._id} className="tx-compact-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                <strong>{g.title}</strong>
                <div style={{ fontSize: "12px", color: "#767676" }}>Target: ₹{g.targetAmount}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {rewards.map((r) => (
            <div
              key={r._id}
              onClick={() => !r.isRevealed && handleReveal(r._id)}
              style={{
                background: r.isRevealed ? "#dcfce7" : "linear-gradient(135deg, #111111 0%, #374151 100%)",
                color: r.isRevealed ? "#16a34a" : "#ffffff",
                borderRadius: "16px",
                padding: "20px 12px",
                textAlign: "center",
                cursor: r.isRevealed ? "default" : "pointer",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{r.isRevealed ? "🎉" : "🎁"}</div>
              <strong style={{ fontSize: "13px", display: "block" }}>{r.title}</strong>
              <span style={{ fontSize: "14px", fontWeight: "800" }}>
                {r.isRevealed ? `₹${r.value} Cashback` : "Tap to Scratch"}
              </span>
            </div>
          ))}
        </div>
      )}
    </MobileFrame>
  );
}
