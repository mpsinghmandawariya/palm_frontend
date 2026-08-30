import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Repeat, Plus, PauseCircle, PlayCircle, Clock, Calendar, CheckCircle2, Inbox } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function AutoPayPage() {
  const navigate = useNavigate();
  const toast = useToast();

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
      toast.error("Failed to load AutoPay mandates");
    }
  };

  useEffect(() => {
    loadMandates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/autopay", { title, amount: Number(amount), billerName });
      toast.success("✓ AutoPay mandate created successfully!");
      setShowCreate(false);
      setTitle("");
      setAmount("");
      setBillerName("");
      loadMandates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create mandate");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await API.patch(`/autopay/${id}`, { status: nextStatus });
      toast.success(`Mandate ${nextStatus === "ACTIVE" ? "resumed" : "paused"} successfully.`);
      loadMandates();
    } catch (err) {
      toast.error("Failed to update mandate status");
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="AutoPay Mandates"
        subtitle="Recurring Automated Bill Settlements"
        showBack={true}
        backTo="/dashboard"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 16px" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Scheduled Mandates</h3>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{mandates.length} active recurring mandates</span>
        </div>

        <button
          className="btn-primary"
          style={{ padding: "8px 14px", fontSize: "12px" }}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={14} style={{ marginRight: "4px" }} /> New Mandate
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="enterprise-card-box" style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>Create AutoPay Mandate</h3>
          <div style={{ marginBottom: "10px" }}>
            <label className="input-label">Mandate Purpose / Title</label>
            <input
              type="text"
              placeholder="e.g. Monthly Fiber Broadband"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label className="input-label">Biller Name</label>
            <input
              type="text"
              placeholder="e.g. ACT Fibernet"
              value={billerName}
              onChange={(e) => setBillerName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="input-label">Monthly Debit Amount (₹)</label>
            <input
              type="number"
              placeholder="899"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button className="btn-primary" type="submit" style={{ width: "100%", marginBottom: "8px" }}>
            Authorize & Save Mandate
          </button>
          <button type="button" className="btn-outline" onClick={() => setShowCreate(false)} style={{ width: "100%" }}>
            Cancel
          </button>
        </form>
      )}

      {mandates.length === 0 ? (
        <div className="empty-state-box" style={{ padding: "40px 10px" }}>
          <Repeat size={36} className="text-muted" style={{ marginBottom: "8px" }} />
          <h4>No AutoPay mandates scheduled</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "14px" }}>
            Automate your recurring electricity, mobile, and internet bills.
          </p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            Schedule First Mandate
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {mandates.map((m) => (
            <div key={m._id} className="tx-compact-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="icon-badge-round" style={{ width: "36px", height: "36px", background: "var(--accent-purple)", color: "#9333ea" }}>
                    <Repeat size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px", display: "block" }}>{m.title}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.billerName}</span>
                  </div>
                </div>

                <span className={`badge-pill ${m.status === "ACTIVE" ? "badge-success" : "badge-neutral"}`}>
                  {m.status}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
                  ₹{m.amount} / Monthly
                </span>

                <button
                  className="btn-outline"
                  style={{ padding: "4px 10px", fontSize: "11px", borderRadius: "8px" }}
                  onClick={() => toggleStatus(m._id, m.status)}
                >
                  {m.status === "ACTIVE" ? (
                    <>
                      <PauseCircle size={12} style={{ marginRight: "4px" }} /> Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle size={12} style={{ marginRight: "4px" }} /> Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileFrame>
  );
}
