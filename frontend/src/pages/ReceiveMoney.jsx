import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Copy, Check, Share2, Download } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function ReceiveMoney() {
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
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

  const upiId = `palmpay.${user?.mobile || "9876543210"}@wallet`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("Wallet Payment ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Receive Payment"
        subtitle="Contactless QR & EasyPay VPA"
        showBack={true}
        backTo="/dashboard"
      />

      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
          Scan this QR code with any Palm Pay terminal or UPI app to transfer funds directly.
        </p>

        {/* QR CODE CARD */}
        <div className="receive-qr-box">
          <div className="receive-qr-inner">
            <QrCode size={160} color="#111111" strokeWidth={1.5} />
          </div>

          <div style={{ marginTop: "14px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Wallet VPA ID
            </span>
            <strong style={{ fontSize: "14px", fontFamily: "monospace", display: "block", color: "var(--text-primary)", marginTop: "2px" }}>
              {upiId}
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button className="btn-primary" onClick={copyUpiId} style={{ flex: 1 }}>
            {copied ? <Check size={16} style={{ marginRight: "4px" }} /> : <Copy size={16} style={{ marginRight: "4px" }} />}
            {copied ? "Copied!" : "Copy Payment ID"}
          </button>

          <button
            className="btn-outline"
            onClick={() => toast.info("Sharing Payment QR Link...")}
            style={{ flex: 1 }}
          >
            <Share2 size={16} style={{ marginRight: "4px" }} /> Share QR
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}