import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Lock, Trash2, EyeOff, CheckCircle } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title="Privacy Policy"
        subtitle="Biometric Data Processing & Protection"
        showBack={true}
        backTo="/profile"
      />

      <div style={{ padding: "10px 0 24px", fontSize: "13px", lineHeight: "1.6", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="icon-badge-round" style={{ background: "var(--accent-blue)", color: "#0284c7", margin: "0 auto 8px" }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "800" }}>Biometric Data Privacy Policy</h2>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Last Updated: August 2026 • GDPR Art. 9 & BIPA Compliant</span>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "14px" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            <EyeOff size={16} color="#0284c7" /> 1. Zero Raw Image Storage
          </h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Palm Pay operates strictly on <strong>mathematical template extraction</strong>. When you scan your palm, the camera frame is processed in volatile memory only for the fraction of a second required to generate a 1280-dimensional feature vector. The raw photograph is <strong>never written to disk or the database</strong>.
          </p>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "14px" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            <Lock size={16} color="var(--color-success)" /> 2. Irreversible Mathematical Templates
          </h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Stored biometric embeddings are normalized numerical vectors produced by MobileNetV2. It is computationally impossible to reconstruct an original palm photograph or print from these stored vectors.
          </p>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "14px" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            <Trash2 size={16} color="var(--color-danger)" /> 3. Right to Erasure (GDPR Art. 17)
          </h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            You maintain full sovereignty over your biometric data. Tapping <strong>"Delete Palm Data"</strong> in your Profile executes an immediate database deletion (`DELETE /api/palm`), permanently dropping all templates and associated quality telemetry from our servers.
          </p>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "18px" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
            <CheckCircle size={16} color="#9333ea" /> 4. Merchant Data Isolation
          </h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Merchant POS terminals receive only a boolean confirmation and verified customer identifier. Merchants never have access to your biometric templates, wallet keys, or payment credentials.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate(-1)} style={{ width: "100%" }}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} /> Return
        </button>
      </div>
    </MobileFrame>
  );
}
