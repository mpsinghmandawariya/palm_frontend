import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function AutoPayPage() {
  const navigate = useNavigate();
  const [mandates, setMandates] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [billerName, setBillerName] = useState("");

  const loadMandates = async () => {
    try {
      const response = await API.get("/autopay");
      setMandates(response.data.mandates || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/autopay", { title, amount: Number(amount), billerName });
      setShowCreate(false);
      setTitle("");
      setAmount("");
      setBillerName("");
      loadMandates();
    } catch (err) {
      alert("Failed to create mandate");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await API.patch(`/autopay/${id}`, { status: nextStatus });
      loadMandates();
    } catch (err) {
      alert("Failed to update mandate");
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← AutoPay Mandates
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 16px" }}>
        <h2 style={{ fontSize: "20px" }}>Recurring AutoPay</h2>
        <button className="btn-black" style={{ width: "auto", padding: "8px 14px", fontSize: "12px" }} onClick={() => setShowCreate(true)}>
          + Create Mandate
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1.5px solid #ece7df", marginBottom: "16px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label className="input-label">Mandate Title</label>
            <input type="text" placeholder="e.g. Monthly Broadband" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label className="input-label">Biller Name</label>
            <input type="text" placeholder="e.g. ACT Fibernet" value={billerName} onChange={(e) => setBillerName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label className="input-label">Amount (₹)</label>
            <input type="number" placeholder="899" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <button className="btn-black" type="submit" style={{ marginBottom: "8px" }}>Save AutoPay Mandate</button>
          <button type="button" className="btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
        </form>
      )}

      {mandates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 10px", color: "#767676" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>🔄</div>
          <p>No active AutoPay mandates scheduled.</p>
        </div>
      ) : (
        mandates.map((m) => (
          <div key={m._id} className="tx-compact-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <strong>{m.title}</strong>
              <span style={{ color: m.status === "ACTIVE" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{m.status}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#767676" }}>{m.billerName} • ₹{m.amount} / Monthly</div>
            <button
              className="btn-outline"
              style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "10px" }}
              onClick={() => toggleStatus(m._id, m.status)}
            >
              {m.status === "ACTIVE" ? "Pause Mandate" : "Resume Mandate"}
            </button>
          </div>
        ))
      )}
    </MobileFrame>
  );
}
