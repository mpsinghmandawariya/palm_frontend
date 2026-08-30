import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Store,
  ChevronRight,
  Inbox,
  QrCode,
  ArrowDownLeft,
  RefreshCw
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SkeletonCard, SkeletonTransactionList } from "../components/SkeletonLoader";
import ReceiveQRModal from "../components/ReceiveQRModal";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Modals
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");
  const [topUpLoading, setTopUpLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        API.get("/wallet"),
        API.get("/transactions?limit=10"),
      ]);

      setWallet(walletRes.data);
      if (walletRes.data?.user) {
        localStorage.setItem("palmPayUser", JSON.stringify(walletRes.data.user));
      }
      setRecentTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("palmPayToken");
        localStorage.removeItem("palmPayUser");
        navigate("/");
        return;
      }
      toast.error(err.response?.data?.message || "Unable to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setTopUpLoading(true);
    try {
      const response = await API.post("/wallet/top-up", { amount: Number(topUpAmount) });
      if (response.data?.success) {
        toast.success(`✓ Added ₹${Number(topUpAmount).toLocaleString("en-IN")} to your wallet!`);
        setShowTopUp(false);
        loadDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Top up failed.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const user = wallet?.user;
  const balance = wallet?.balance ?? user?.walletBalance ?? 0;
  const isPalmRegistered = user?.palmRegistered ?? false;
  const avatar = user?.avatar || "";

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
        title="Palm Pay"
        subtitle="Biometric Wallet"
        showMlHealth={true}
        showQrReceive={true}
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <SkeletonCard height="160px" />
          <SkeletonTransactionList count={3} />
        </div>
      ) : (
        <>
          {/* WALLET BALANCE HERO CARD */}
          <div className="dashboard-balance-card">
            <div className="balance-top-row">
              <div className="balance-greeting">
                <span className="balance-sub-label">Hello, {user?.name?.split(" ")[0] || "User"}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Wallet Balance</span>
                <h2 className="balance-large-amount">{formatCurrency(balance)}</h2>
              </div>

              <div className="balance-user-badge" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user?.name}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--border-medium)",
                    }}
                  />
                ) : (
                  <span className="user-initial-bubble">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
                <span className="user-greeting-name">{user?.name?.split(" ")[0] || "User"}</span>
              </div>
            </div>

            {isPalmRegistered ? (
              <div className="biometric-status-chip active">
                <ShieldCheck size={14} />
                <span>Palm ID Active • 1280-d Template</span>
              </div>
            ) : (
              <div
                className="biometric-status-chip pending"
                onClick={() => navigate("/palm-register")}
                style={{ cursor: "pointer" }}
              >
                <Fingerprint size={14} />
                <span>Enroll Palm ID to enable 1-tap pay →</span>
              </div>
            )}

            {/* THREE PRIMARY ACTIONS: [ PAY ] [ RECEIVE QR ] [ ADD MONEY ] */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "8px", marginTop: "10px" }}>
              <button
                className="btn-primary"
                onClick={() => navigate("/pay")}
                style={{ padding: "10px 8px", fontSize: "13px" }}
              >
                <Fingerprint size={16} style={{ marginRight: "4px" }} />
                Pay
              </button>

              <button
                className="btn-outline"
                onClick={() => setShowReceiveQR(true)}
                style={{ padding: "10px 8px", fontSize: "13px" }}
              >
                <QrCode size={15} style={{ marginRight: "4px" }} />
                Receive
              </button>

              <button
                className="btn-outline"
                onClick={() => setShowTopUp(true)}
                style={{ padding: "10px 8px", fontSize: "13px" }}
              >
                <Plus size={15} style={{ marginRight: "4px" }} />
                Top Up
              </button>
            </div>
          </div>

          {/* MERCHANT POS BANNER (PHASE 2 ENTRY POINT) */}
          <div
            className="enterprise-card-box"
            onClick={() => navigate("/pos")}
            style={{
              cursor: "pointer",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-subtle)",
              borderColor: "var(--border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "var(--accent-purple)", color: "#9333ea" }}>
                <Store size={20} />
              </div>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>Merchant POS Terminal</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Test 1:N Biometric Identification at Store Checkout
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </div>

          {/* RECENT TRANSACTIONS */}
          <div style={{ marginTop: "8px" }}>
            <div className="section-header-row">
              <h3>Recent Transactions</h3>
              <button className="btn-link" onClick={() => navigate("/transactions")}>
                View all →
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div
                className="tx-compact-item empty"
                onClick={() => navigate("/pay")}
                role="button"
                tabIndex={0}
              >
                <div className="tx-compact-left">
                  <div className="tx-avatar" style={{ background: "var(--bg-subtle)" }}>
                    <Inbox size={18} className="text-muted" />
                  </div>
                  <div className="tx-compact-info">
                    <h5>No transactions yet</h5>
                    <span>Make your first palm payment</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </div>
            ) : (
              recentTransactions.slice(0, 5).map((tx) => {
                const isTopUp = tx.type === "WALLET_TOPUP";
                const isReceived = tx.type === "RECEIVED";
                const isPos = tx.type === "POS_PAYMENT";
                const isTransfer = tx.type === "TRANSFER";

                let icon = <Fingerprint size={18} />;
                let avatarBg = "var(--bg-subtle)";
                let iconColor = "var(--text-primary)";

                if (isTopUp) {
                  icon = <Plus size={18} />;
                  avatarBg = "var(--color-accent-green)";
                  iconColor = "var(--color-success)";
                } else if (isReceived) {
                  icon = <ArrowDownLeft size={18} />;
                  avatarBg = "var(--color-accent-green)";
                  iconColor = "var(--color-success)";
                } else if (isPos) {
                  icon = <Store size={18} />;
                  avatarBg = "var(--accent-purple)";
                  iconColor = "#9333ea";
                } else if (isTransfer) {
                  icon = <ArrowUpRight size={18} />;
                  avatarBg = "var(--color-accent-blue)";
                  iconColor = "#0284c7";
                }

                const title = tx.recipientName || (
                  isTopUp ? "Wallet Deposit" :
                  isReceived ? "Money Received" :
                  isPos ? "Store POS Terminal" :
                  "Palm Payment"
                );

                const isCredit = isTopUp || isReceived;

                return (
                  <div
                    key={tx._id || tx.transactionId}
                    className="tx-compact-item"
                    onClick={() => navigate("/transactions")}
                  >
                    <div className="tx-compact-left">
                      <div className="tx-avatar" style={{ background: avatarBg, color: iconColor }}>
                        {icon}
                      </div>
                      <div className="tx-compact-info">
                        <h5>{title}</h5>
                        <span>
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                          {tx.matchScore ? ` • ${tx.matchScore}% Match` : ""}
                          {tx.authMethod ? ` • ${tx.authMethod}` : ""}
                        </span>
                      </div>
                    </div>

                    <div
                      className="tx-compact-amount"
                      style={{ color: isCredit ? "var(--color-success)" : "var(--text-primary)", fontWeight: "700" }}
                    >
                      {isCredit ? "+ " : "- "}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* RECEIVE MONEY QR CODE MODAL */}
      <ReceiveQRModal
        isOpen={showReceiveQR}
        onClose={() => setShowReceiveQR(false)}
        user={user}
      />

      {/* TOP-UP MODAL */}
      {showTopUp && (
        <div className="modal-backdrop" onClick={() => setShowTopUp(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-icon-bubble">
              <Plus size={24} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>Add Money</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Add test funds to your Palm Pay digital wallet
            </p>

            <div className="quick-amount-selector">
              {["500", "1000", "2000", "5000"].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-pill-btn ${topUpAmount === amt ? "active" : ""}`}
                  onClick={() => setTopUpAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <form onSubmit={handleTopUpSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="number"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="form-input"
                  style={{ fontSize: "24px", textAlign: "center", fontWeight: "800" }}
                  required
                />
              </div>

              <button className="btn-primary" type="submit" disabled={topUpLoading} style={{ width: "100%", marginBottom: "10px" }}>
                {topUpLoading ? "Adding Funds..." : `Add ₹${topUpAmount} to Wallet`}
              </button>

              <button type="button" className="btn-outline" onClick={() => setShowTopUp(false)} style={{ width: "100%" }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}