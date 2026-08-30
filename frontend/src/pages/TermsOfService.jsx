import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <MobileFrame showBottomNav={false}>
      <Header
        title="Terms of Service"
        subtitle="Platform Disclaimer & Scope of Service"
        showBack={true}
        backTo="/profile"
      />

      <div style={{ padding: "10px 0 24px", fontSize: "13px", lineHeight: "1.6", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="icon-badge-round" style={{ background: "var(--accent-purple)", color: "#9333ea", margin: "0 auto 8px" }}>
            <FileText size={26} />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: "800" }}>Terms of Service</h2>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Technical Portfolio & Demonstration Environment</span>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "14px", borderLeft: "4px solid #0284c7" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>1. Demonstration Scope</h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Palm Pay is a technical portfolio and engineering demonstration project developed to showcase contactless computer-vision-based biometric payment systems (modeled on Tencent Weixin Palm Pay and HandPay).
          </p>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "14px", borderLeft: "4px solid var(--color-success)" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>2. Digital Wallet & Simulated Currency</h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Balances shown (₹ INR) represent simulated test funds within a closed sandbox ledger. No real currency is transferred, deposited, or debited to any banking network.
          </p>
        </div>

        <div className="enterprise-card-box" style={{ marginBottom: "18px", borderLeft: "4px solid #9333ea" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>3. Security & Biometric Rights</h4>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Users may revoke consent and wipe their stored 1280-d mathematical palm templates at any time. All cryptographic hashing, token authentication, and atomic database protections conform to enterprise standards.
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate(-1)} style={{ width: "100%" }}>
          <ArrowLeft size={16} style={{ marginRight: "6px" }} /> Return
        </button>
      </div>
    </MobileFrame>
  );
}
