import { useNavigate } from "react-router-dom";
import { Plus, ArrowUpRight, Zap, Fingerprint, ChevronRight, Inbox } from "lucide-react";

export default function RecentTransactions({ transactions = [], limit = 3 }) {
  const navigate = useNavigate();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const displayList = transactions.slice(0, limit);

  return (
    <div className="recent-tx-container">
      <div className="section-header-row">
        <h3>Recent Transactions</h3>
        <button className="btn-link" onClick={() => navigate("/transactions")}>
          See All <ChevronRight size={14} />
        </button>
      </div>

      {displayList.length === 0 ? (
        <div
          className="tx-compact-item empty"
          onClick={() => navigate("/pay-with-palm")}
          role="button"
          tabIndex={0}
        >
          <div className="tx-compact-left">
            <div className="tx-avatar" style={{ background: "var(--bg-subtle)" }}>
              <Inbox size={18} className="text-muted" />
            </div>
            <div className="tx-compact-info">
              <h5>No transactions recorded</h5>
              <span>Tap to make your first contactless payment</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted" />
        </div>
      ) : (
        displayList.map((tx) => {
          const isTopUp = tx.type === "WALLET_TOPUP";
          const isWithdraw = tx.type === "WITHDRAWAL";
          const isBill = tx.type === "BILL_PAYMENT";

          let icon = <Fingerprint size={18} />;
          let avatarBg = "var(--bg-subtle)";
          let iconColor = "var(--text-primary)";

          if (isTopUp) {
            icon = <Plus size={18} />;
            avatarBg = "var(--color-accent-green)";
            iconColor = "var(--color-success)";
          } else if (isWithdraw) {
            icon = <ArrowUpRight size={18} />;
            avatarBg = "var(--color-accent-blue)";
            iconColor = "#0284c7";
          } else if (isBill) {
            icon = <Zap size={18} />;
            avatarBg = "var(--color-accent-pink)";
            iconColor = "var(--color-accent-pink-dark)";
          }

          const title = tx.recipientName || (
            isTopUp ? "Wallet Deposit" :
            isWithdraw ? "Bank Withdrawal" :
            isBill ? "Utility Bill Payment" :
            "Palm Biometric Payment"
          );

          return (
            <div
              key={tx._id}
              className="tx-compact-item"
              onClick={() => navigate("/transactions")}
              role="button"
              tabIndex={0}
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
                      year: "numeric",
                    })} • {tx.category || "Payment"}
                  </span>
                </div>
              </div>

              <div className="tx-compact-amount" style={{ color: isTopUp ? "var(--color-success)" : "var(--text-primary)", fontWeight: "700" }}>
                {isTopUp ? "+ " : "- "}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
