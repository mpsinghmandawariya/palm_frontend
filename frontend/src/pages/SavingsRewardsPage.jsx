import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Target, Sparkles, Plus, CheckCircle2, Trophy, Inbox } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function SavingsRewardsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [savings, setSavings] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activeTab, setActiveTab] = useState("REWARDS");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const fetchData = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        API.get("/savings-rewards/savings"),
        API.get("/savings-rewards/rewards"),
      ]);
      setSavings(sRes.data.goals || []);
      setRewards(rRes.data.rewards || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReveal = async (id) => {
    try {
      const res = await API.post(`/savings-rewards/rewards/${id}/reveal`);
      setRewards((prev) => prev.map((r) => (r._id === id ? res.data.reward : r)));
      toast.success("🎉 Congratulations! Cashback credited to your wallet!");
    } catch (err) {
      toast.error("Unable to scratch card");
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await API.post("/savings-rewards/savings", { title: goalTitle, targetAmount: Number(goalAmount) });
      toast.success("🎯 Savings goal created successfully!");
      setShowGoalModal(false);
      setGoalTitle("");
      setGoalAmount("");
      fetchData();
    } catch (err) {
      toast.error("Failed to create savings goal");
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Savings & Rewards"
        subtitle="Cashback, Scratch Cards & Goals"
        showBack={true}
        backTo="/dashboard"
      />

      <div className="drawer-filter-bar" style={{ margin: "14px 0 16px", padding: 0 }}>
        <button
          className={`pill-tab ${activeTab === "REWARDS" ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab("REWARDS")}
        >
          <Gift size={14} style={{ marginRight: "4px" }} /> Rewards & Scratch Cards
        </button>
        <button
          className={`pill-tab ${activeTab === "SAVINGS" ? "active" : ""}`}
          style={{ flex: 1 }}
          onClick={() => setActiveTab("SAVINGS")}
        >
          <Target size={14} style={{ marginRight: "4px" }} /> Savings Goals
        </button>
      </div>

      {activeTab === "REWARDS" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {rewards.map((r) => (
            <div
              key={r._id}
              onClick={() => !r.isRevealed && handleReveal(r._id)}
              className={`reward-scratch-card ${r.isRevealed ? "revealed" : "hidden"}`}
              role="button"
              tabIndex={0}
            >
              <div className="reward-icon-circle">
                {r.isRevealed ? <Trophy size={26} /> : <Gift size={26} />}
              </div>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>{r.title}</strong>
              <span className="reward-value-tag">
                {r.isRevealed ? `₹${r.value} Cashback` : "Tap to Scratch"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700" }}>Active Goals</h3>
            <button
              className="btn-primary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => setShowGoalModal(true)}
            >
              <Plus size={13} style={{ marginRight: "4px" }} /> New Goal
            </button>
          </div>

          {savings.length === 0 ? (
            <div className="empty-state-box" style={{ padding: "40px 10px" }}>
              <Target size={36} className="text-muted" style={{ marginBottom: "8px" }} />
              <h4>No savings goals</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
                Set a target fund for travel, gadgets, or emergency savings.
              </p>
              <button className="btn-primary" onClick={() => setShowGoalModal(true)}>
                Create Goal
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {savings.map((g) => (
                <div key={g._id} className="tx-compact-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <strong style={{ fontSize: "14px" }}>{g.title}</strong>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-primary)" }}>
                      ₹{Number(g.targetAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="multi-progress-bar" style={{ height: "6px", width: "100%", background: "var(--bg-subtle)" }}>
                    <div className="progress-segment" style={{ width: "35%", backgroundColor: "#10b981" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target: ₹{g.targetAmount} • 35% Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="modal-backdrop" onClick={() => setShowGoalModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "12px" }}>Create Savings Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div style={{ marginBottom: "10px" }}>
                <label className="input-label">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. New Laptop Fund"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="input-label">Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="75000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button className="btn-primary" type="submit" style={{ width: "100%", marginBottom: "8px" }}>
                Save Goal
              </button>
              <button type="button" className="btn-outline" onClick={() => setShowGoalModal(false)} style={{ width: "100%" }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
