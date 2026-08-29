import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function ReceiveMoney() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await API.get("/wallet");
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  const generateRequest = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    setRequestId(`EP-${Date.now()}-${randomNumber}`);
  };

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(requestId || `easypay.${user?.mobile}@wallet`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copied!");
    }
  };

  return (
    <MobileFrame showBottomNav={true}>
      <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
        ← Receive Money
      </button>

      <div style={{ textAlign: "center", margin: "16px 0 20px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 10px" }}>
          📥
        </div>
        <h2 style={{ fontSize: "20px" }}>Receive Payment</h2>
        <span style={{ color: "#767676", fontSize: "13px" }}>Show QR code or share your EasyPay ID</span>
      </div>

      {/* QR PLACEHOLDER CARD */}
      <div style={{ background: "#f8f6f2", border: "1.5px dashed #ece7df", borderRadius: "24px", padding: "28px", textAlign: "center", margin: "0 auto 20px", maxWidth: "260px" }}>
        <div style={{ width: "160px", height: "160px", background: "white", margin: "0 auto 12px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px", border: "1px solid #ece7df" }}>
          🏁
        </div>
        <strong style={{ fontSize: "14px", fontFamily: "monospace", display: "block" }}>
          easypay.{user?.mobile || "9876543210"}@wallet
        </strong>
      </div>

      <button className="btn-black" onClick={copyRequest} style={{ marginBottom: "12px" }}>
        {copied ? "✓ Copied to Clipboard!" : "Copy Payment ID"}
      </button>

      <button className="btn-outline" onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>
    </MobileFrame>
  );
}