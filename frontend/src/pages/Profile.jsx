import { useEffect, useState, useRef } from "react";
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
  Lock,
  QrCode,
  Camera,
  Edit2,
  Check
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import ReceiveQRModal from "../components/ReceiveQRModal";
import { SkeletonCard } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profile");
      setProfile(response.data.user);
      setEditName(response.data.user.name);
      setEditPhone(response.data.user.phone);
      localStorage.setItem("palmPayUser", JSON.stringify(response.data.user));
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

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      try {
        const res = await API.put("/profile", { avatar: base64 });
        if (res.data?.success) {
          setProfile(res.data.user);
          localStorage.setItem("palmPayUser", JSON.stringify(res.data.user));
          toast.success("✓ Profile photo updated successfully!");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await API.put("/profile", {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      if (res.data?.success) {
        setProfile(res.data.user);
        localStorage.setItem("palmPayUser", JSON.stringify(res.data.user));
        toast.success("✓ Profile information updated!");
        setShowEditModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingEdit(false);
    }
  };

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
        title="Profile & Settings"
        subtitle="Identity, QR & Privacy Controls"
        showBack={true}
        backTo="/dashboard"
      />

      {loading ? (
        <div style={{ marginTop: "16px" }}>
          <SkeletonCard height="160px" />
        </div>
      ) : (
        <div style={{ padding: "8px 0" }}>
          {/* USER AVATAR & HEADER */}
          <div style={{ textAlign: "center", margin: "10px 0 16px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 10px" }}>
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--border-medium)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
                  }}
                />
              ) : (
                <div
                  className="user-avatar-large"
                  style={{ width: "80px", height: "80px", fontSize: "30px", margin: 0 }}
                >
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              {/* UPLOAD / EDIT AVATAR CAMERA BUTTON */}
              <button
                type="button"
                className="btn-icon"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "-4px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", margin: 0 }}>{profile?.name || "User"}</h2>
              <button
                className="btn-icon"
                onClick={() => setShowEditModal(true)}
                title="Edit name and mobile"
                style={{ width: "24px", height: "24px", padding: 0 }}
              >
                <Edit2 size={13} className="text-muted" />
              </button>
            </div>

            <span style={{ color: "var(--text-muted)", fontSize: "13px", display: "block", marginTop: "2px" }}>
              {profile?.email} • +91 {profile?.phone}
            </span>
          </div>

          {/* MY QR CODE RECEIVE MONEY BANNER */}
          <div
            className="enterprise-card-box"
            onClick={() => setShowQRModal(true)}
            style={{
              cursor: "pointer",
              marginBottom: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--color-accent-blue)",
              borderColor: "rgba(2, 132, 199, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "#ffffff", color: "#0284c7" }}>
                <QrCode size={20} />
              </div>
              <div>
                <strong style={{ fontSize: "14px", display: "block", color: "#0284c7" }}>My Payment QR Code</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Show QR to receive money into your Palm Pay wallet
                </span>
              </div>
            </div>
            <ChevronRight size={18} color="#0284c7" />
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

          {/* PRIVACY & BIOMETRIC CONTROLS */}
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

      {/* RECEIVE MONEY QR CODE MODAL */}
      <ReceiveQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        user={profile}
      />

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "14px" }}>Edit Profile</h3>
            <form onSubmit={handleSaveProfileEdit}>
              <div style={{ marginBottom: "12px", textAlign: "left" }}>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: "16px", textAlign: "left" }}>
                <label className="input-label">Mobile Number</label>
                <input
                  type="tel"
                  maxLength="10"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button className="btn-primary" type="submit" disabled={savingEdit} style={{ width: "100%", marginBottom: "10px" }}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>

              <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)} style={{ width: "100%" }}>
                Cancel
              </button>
            </form>
          </div>
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