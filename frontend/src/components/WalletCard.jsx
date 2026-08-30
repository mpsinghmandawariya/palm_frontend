import { Plus, Send, ArrowUpRight, Fingerprint, ShieldCheck } from "lucide-react";

export default function WalletCard({
  balance,
  userName,
  palmRegistered = false,
  onTopUp,
  onSend,
  onWithdraw,
  onPalmPay,
}) {
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(balance || 0);

  return (
    <div className="dashboard-balance-card">
      <div className="balance-top-row">
        <div className="balance-greeting">
          <span className="balance-sub-label">Available Balance</span>
          <h2 className="balance-large-amount">{formattedBalance}</h2>
        </div>

        <div className="balance-user-badge">
          <span className="user-initial-bubble">
            {userName?.charAt(0)?.toUpperCase() || "S"}
          </span>
          <span className="user-greeting-name">{userName?.split(" ")[0] || "User"}</span>
        </div>
      </div>

      {palmRegistered ? (
        <div className="biometric-status-chip active">
          <ShieldCheck size={14} />
          <span>Palm ID Active • Instant Auth</span>
        </div>
      ) : (
        <div className="biometric-status-chip pending">
          <Fingerprint size={14} />
          <span>Biometric ID Not Enrolled</span>
        </div>
      )}

      <div className="action-pill-bar">
        {onTopUp && (
          <button className="action-pill-item" onClick={onTopUp} aria-label="Top Up Wallet Balance">
            <div className="action-pill-icon">
              <Plus size={18} />
            </div>
            <span>Top Up</span>
          </button>
        )}

        {onSend && (
          <button className="action-pill-item" onClick={onSend} aria-label="Send Money to Recipient">
            <div className="action-pill-icon">
              <Send size={16} />
            </div>
            <span>Send</span>
          </button>
        )}

        {onWithdraw && (
          <button className="action-pill-item" onClick={onWithdraw} aria-label="Withdraw Funds to Bank">
            <div className="action-pill-icon">
              <ArrowUpRight size={18} />
            </div>
            <span>Withdraw</span>
          </button>
        )}

        {onPalmPay && (
          <button className="action-pill-item hero" onClick={onPalmPay} aria-label="Pay with Contactless Palm Biometrics">
            <div className="action-pill-icon">
              <Fingerprint size={20} strokeWidth={2.2} />
            </div>
            <span>Palm Pay</span>
          </button>
        )}
      </div>
    </div>
  );
}
