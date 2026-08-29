import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Security Center
      </button>

      <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 10px" }}>
          🛡️
        </div>
        <h2 style={{ fontSize: "20px" }}>Security & Biometrics</h2>
        <p style={{ color: "#767676", fontSize: "13px" }}>Manage Palm ID, Risk Controls & PIN</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="tx-compact-item" onClick={() => navigate("/palm-register")}>
          <div className="tx-compact-left">
            <div className="tx-avatar">🖐</div>
            <div className="tx-compact-info">
              <h5>Palm Biometrics Template</h5>
              <span>1280-d Vector • MobileNetV2 Encrypted</span>
            </div>
          </div>
          <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: "700" }}>Active →</span>
        </div>

        <div className="tx-compact-item" style={{ cursor: "default" }}>
          <div className="tx-compact-left">
            <div className="tx-avatar">🔑</div>
            <div className="tx-compact-info">
              <h5>4-Digit Security PIN</h5>
              <span>Required for fallback authentication</span>
            </div>
          </div>
          <span style={{ color: "#111111", fontSize: "12px", fontWeight: "700" }}>Set</span>
        </div>

        <div className="tx-compact-item" style={{ cursor: "default" }}>
          <div className="tx-compact-left">
            <div className="tx-avatar">⚙️</div>
            <div className="tx-compact-info">
              <h5>AI Fraud Risk Engine</h5>
              <span>Evaluates 0-100 real-time payment risk score</span>
            </div>
          </div>
          <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: "700" }}>Active</span>
        </div>
      </div>
    </MobileFrame>
  );
}
