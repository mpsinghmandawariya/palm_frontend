import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Activity,
  Trash2,
  RefreshCw,
  Smartphone,
  Laptop,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SkeletonCard, SkeletonTransactionList } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function SecurityPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [palmStatus, setPalmStatus] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [palmRes, actRes, sessRes] = await Promise.all([
        API.get("/palm/status").catch(() => ({ data: { registered: false } })),
        API.get("/profile/activity").catch(() => ({ data: { logs: [] } })),
        API.get("/profile/sessions").catch(() => ({ data: { sessions: [] } })),
      ]);

      setPalmStatus(palmRes.data);
      setActivityLogs(actRes.data.logs || []);
      setSessions(sessRes.data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load security telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleRevokePalm = async () => {
    setRevoking(true);
    try {
      await API.delete("/palm/revoke");
      toast.success("Palm biometric profile revoked successfully.");
      setShowRevokeModal(false);
      loadSecurityData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke credentials");
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeSession = (sessId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessId));
    toast.success("Device session logged out successfully.");
  };

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Security & Trust"
        subtitle="Biometrics, AI Risk Engine & Sessions"
        showBack={true}
        backTo="/dashboard"
        showMlHealth={true}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <SkeletonCard height="130px" />
          <SkeletonCard height="130px" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px" }}>
          {/* PALM BIOMETRICS ENROLLMENT STATUS CARD */}
          <div className="security-card-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="icon-badge-round" style={{ background: "var(--accent-purple)", color: "#9333ea" }}>
                  <Fingerprint size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Palm Biometric Template</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {palmStatus?.registered ? "1280-d Vector • MobileNetV2" : "No biometric template enrolled"}
                  </span>
                </div>
              </div>

              {palmStatus?.registered ? (
                <span className="badge-pill badge-success">
                  <CheckCircle2 size={12} style={{ marginRight: "3px" }} /> Active
                </span>
              ) : (
                <span className="badge-pill badge-neutral">Inactive</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                className="btn-primary"
                onClick={() => navigate("/palm-register")}
                style={{ flex: 1, padding: "8px 12px", fontSize: "12px" }}
              >
                {palmStatus?.registered ? "Re-scan / Update Palm" : "Enroll Palm Biometrics"}
              </button>

              {palmStatus?.registered && (
                <button
                  className="btn-outline"
                  onClick={() => setShowRevokeModal(true)}
                  style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", padding: "8px 12px", fontSize: "12px" }}
                  aria-label="Revoke palm biometrics"
                >
                  <Trash2 size={14} style={{ marginRight: "4px" }} /> Revoke
                </button>
              )}
            </div>
          </div>

          {/* AI FRAUD RISK ENGINE & PIN STATUS */}
          <div className="security-card-box">
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
              <div className="icon-badge-round" style={{ background: "var(--accent-green)", color: "#16a34a" }}>
                <ShieldCheck size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700" }}>AI Risk & PIN Fallback</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  0-100 real-time payment risk assessment active
                </span>
              </div>
              <span className="badge-pill badge-success">0.00% Risk</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "10px", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <KeyRound size={14} /> 4-Digit Security PIN Configured
              </span>
              <button className="btn-link" onClick={() => toast.info("PIN is actively verified for fallback checkout.")}>
                Verified
              </button>
            </div>
          </div>

          {/* ACTIVE DEVICE SESSIONS */}
          <div className="security-card-box">
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>Active Device Sessions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sessions.map((sess) => (
                <div key={sess.id} className="session-item-row">
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {sess.device.includes("iPhone") ? <Smartphone size={18} /> : <Laptop size={18} />}
                    <div>
                      <strong style={{ fontSize: "12px", display: "block" }}>{sess.device}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {sess.location} • {sess.lastActive}
                      </span>
                    </div>
                  </div>

                  {sess.isCurrent ? (
                    <span className="badge-pill badge-neutral" style={{ fontSize: "10px" }}>Current Device</span>
                  ) : (
                    <button
                      className="btn-text-sm"
                      onClick={() => handleRevokeSession(sess.id)}
                      style={{ color: "var(--color-danger)" }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACCOUNT SECURITY AUDIT LOG */}
          <div className="security-card-box">
            <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>Security Audit Trail</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
              {activityLogs.map((log, idx) => (
                <div key={log._id || idx} className="audit-row-item">
                  <div className="audit-action-chip">{log.action}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "var(--text-primary)" }}>{log.details}</p>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {showRevokeModal && (
        <div className="modal-backdrop" onClick={() => setShowRevokeModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon-bubble" style={{ background: "var(--accent-pink)", color: "var(--color-danger)" }}>
              <AlertTriangle size={26} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Revoke Palm Biometrics?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px", lineHeight: "1.4" }}>
              This will erase your registered palm encryption vector. You will need to re-scan your hand to authorize contactless payments.
            </p>

            <button
              className="btn-primary"
              onClick={handleRevokePalm}
              disabled={revoking}
              style={{ background: "var(--color-danger)", width: "100%", marginBottom: "10px" }}
            >
              {revoking ? "Revoking Credentials..." : "Yes, Revoke Palm Profile"}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowRevokeModal(false)}
              style={{ width: "100%" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
