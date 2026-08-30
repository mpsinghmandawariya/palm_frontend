import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowRight, Store, ArrowLeft } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SuccessVictoryIllustration } from "../components/Illustrations";

export default function POSReceipt() {
  const navigate = useNavigate();
  const location = useLocation();

  const receiptData = location.state || {
    receipt: {
      transactionId: "POS-TX-9902-124",
      amount: 150,
      customerName: "Samantha Patel",
      remainingBalance: 4850,
      matchScore: 98.4,
    },
    merchantName: "Starbucks Coffee (Counter 1)",
  };

  const receipt = receiptData.receipt;
  const merchantName = receiptData.merchantName;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <MobileFrame showBottomNav={false}>
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <Header
          title="Merchant POS Receipt"
          subtitle={merchantName}
          showBack={false}
        />

        <div style={{ width: "150px", margin: "8px auto 14px" }}>
          <SuccessVictoryIllustration />
        </div>

        <span className="badge-pill badge-success" style={{ padding: "6px 16px", fontSize: "14px", marginBottom: "8px" }}>
          <CheckCircle2 size={16} style={{ marginRight: "6px" }} /> ✓ PAYMENT SUCCESSFUL
        </span>

        <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0 2px" }}>
          {formatCurrency(receipt.amount)}
        </h2>
        <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "20px" }}>
          Paid by: <strong>{receipt.customerName}</strong>
        </span>

        {/* RECEIPT SUMMARY CARD */}
        <div className="enterprise-card-box" style={{ textAlign: "left", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Biometric Identification</span>
            <strong style={{ fontSize: "12px", color: "var(--color-success)" }}>
              Palm ID ({receipt.matchScore || 98}% Match) ✓
            </strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Transaction ID</span>
            <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "700" }}>
              {receipt.transactionId}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Merchant Terminal</span>
            <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
              {merchantName}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Customer Remaining Balance</span>
            <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
              {formatCurrency(receipt.remainingBalance)}
            </strong>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/pos")}
          style={{ width: "100%", padding: "14px", marginBottom: "10px" }}
        >
          <Store size={18} style={{ marginRight: "6px" }} />
          New POS Sale
        </button>

        <button
          className="btn-outline"
          onClick={() => navigate("/dashboard")}
          style={{ width: "100%" }}
        >
          <ArrowLeft size={16} style={{ marginRight: "4px" }} /> Return to Customer App
        </button>
      </div>
    </MobileFrame>
  );
}
