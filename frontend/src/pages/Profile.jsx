import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Fingerprint,
  CreditCard,
  ShieldCheck,
  LogOut,
  Trash2,
  RefreshCw,
  Store,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SkeletonCard } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profile");
      setProfile(response.data.user);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleDeletePalmData = async () => {
    setDeleting(true);
    try {
      await API.delete("/palm");
      toast.success("✓ Biometric palm profile and embeddings permanently deleted");
      setShowDeleteModal(false);
      loadProfile();
    } catch (err) {
      toast.error("Failed to delete palm data");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");
    toast.info("Logged out successfully");
    navigate("/");
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Profile & Privacy"
        subtitle="Biometric Identity & Privacy Controls"
        showBack={true}
        backTo="/dashboard"
      />

      {loading ? (
        <div style={{ marginTop: "16px" }}>
          <SkeletonCard height="160px" />
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {/* USER HEADER */}
          <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
            <div className="user-avatar-large" style={{ margin: "0 auto 8px" }}>
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800" }}>{profile?.name || "User"}</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              {profile?.email} • {profile?.phone || profile?.mobile}
            </span>
          </div>

          {/* STATUS CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {/* PALM ID STATUS */}
            <div className="tx-compact-item" style={{ cursor: "default" }}>
              <div className="tx-compact-left">
                <div className="icon-badge-round" style={{ background: "var(--accent-purple)", color: "#9333ea" }}>
                  <Fingerprint size={20} />
                </div>
                <div className="tx-compact-info">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Biometric Identity</span>
                  <h5 style={{ fontSize: "14px", fontWeight: "700" }}>
                    Palm ID: {profile?.palmRegistered ? "● Registered" : "○ Not Enrolled"}
                  </h5>
                </div>
              </div>

              {profile?.palmRegistered ? (
                <span className="badge-pill badge-success">
                  <CheckCircle2 size={12} style={{ marginRight: "3px" }} /> Enrolled (1280-d)
                </span>
              ) : (
                <span className="badge-pill badge-neutral">Inactive</span>
              )}
            </div>

            {/* WALLET BALANCE */}
            <div className="tx-compact-item" style={{ cursor: "default" }}>
              <div className="tx-compact-left">
                <div className="icon-badge-round" style={{ background: "var(--accent-green)", color: "var(--color-success)" }}>
                  <CreditCard size={20} />
                </div>
                <div className="tx-compact-info">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Available Balance</span>
                  <h5 style={{ fontSize: "15px", fontWeight: "800" }}>
                    Wallet: {formatCurrency(profile?.walletBalance || 0)}
                  </h5>
                </div>
              </div>
            </div>

            {/* SECURITY STATUS */}
            <div className="tx-compact-item" style={{ cursor: "default" }}>
              <div className="tx-compact-left">
                <div className="icon-badge-round" style={{ background: "var(--accent-blue)", color: "#0284c7" }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="tx-compact-info">
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Payment Authentication</span>
                  <h5 style={{ fontSize: "14px", fontWeight: "700" }}>Palm Biometrics + PIN Fallback ✓</h5>
                </div>
              </div>
            </div>
          </div>

          {/* PRIVACY & BIOMETRIC CONTROLS (SECTION 6) */}
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
            Biometric Privacy Controls
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <button
              className="btn-outline"
              onClick={() => navigate("/palm-register")}
              style={{ width: "100%", justifyContent: "flex-start", padding: "12px 14px", gap: "10px" }}
            >
              <RefreshCw size={16} />
              <span style={{ flex: 1, textAlign: "left" }}>Re-register Palm Biometrics</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            {profile?.palmRegistered && (
              <button
                className="btn-outline"
                onClick={() => setShowDeleteModal(true)}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: "12px 14px",
                  gap: "10px",
                  color: "var(--color-danger)",
                  borderColor: "rgba(220, 38, 38, 0.3)",
                }}
              >
                <Trash2 size={16} />
                <span style={{ flex: 1, textAlign: "left" }}>Delete Palm Data & Templates</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* LEGAL & COMPLIANCE SECTION */}
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
            Legal & Compliance
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <button
              className="btn-outline"
              onClick={() => navigate("/privacy")}
              style={{ width: "100%", justifyContent: "flex-start", padding: "12px 14px", gap: "10px" }}
            >
              <Lock size={16} color="#0284c7" />
              <span style={{ flex: 1, textAlign: "left" }}>Biometric Privacy Policy (GDPR / BIPA)</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <button
              className="btn-outline"
              onClick={() => navigate("/terms")}
              style={{ width: "100%", justifyContent: "flex-start", padding: "12px 14px", gap: "10px" }}
            >
              <FileText size={16} color="#9333ea" />
              <span style={{ flex: 1, textAlign: "left" }}>Terms of Service & Demo Scope</span>
              <ChevronRight size={16} className="text-muted" />
            </button>
          </div>

          {/* PHASE 2 MERCHANT POS LINK */}
          <button
            className="btn-outline"
            onClick={() => navigate("/pos")}
            style={{ width: "100%", justifyContent: "flex-start", padding: "12px 14px", gap: "10px", marginBottom: "10px" }}
          >
            <Store size={16} color="#9333ea" />
            <span style={{ flex: 1, textAlign: "left" }}>Open Merchant POS Terminal (1:N Demo)</span>
            <ChevronRight size={16} className="text-muted" />
          </button>

          {/* LOGOUT BUTTON */}
          <button
            className="btn-outline"
            onClick={handleLogout}
            style={{ width: "100%", marginTop: "10px", color: "var(--text-muted)" }}
          >
            <LogOut size={16} style={{ marginRight: "6px" }} /> Log Out
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETE PALM DATA */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon-bubble" style={{ background: "var(--accent-pink)", color: "var(--color-danger)" }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Delete Palm Biometric Data?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px", lineHeight: "1.4" }}>
              In accordance with GDPR & Biometric Data Privacy standards, this will permanently delete your stored 1280-d mathematical palm template from our servers.
            </p>

            <button
              className="btn-primary"
              onClick={handleDeletePalmData}
              disabled={deleting}
              style={{ background: "var(--color-danger)", width: "100%", marginBottom: "10px" }}
            >
              {deleting ? "Deleting..." : "Permanently Delete Biometric Data"}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowDeleteModal(false)}
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