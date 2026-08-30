import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Fingerprint,
  Plus,
  ArrowUpRight,
  Store,
  Calendar,
  Inbox
} from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { SkeletonTransactionList } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Transactions() {
  const navigate = useNavigate();
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await API.get("/transactions");
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      toast.info("No transaction records to export");
      return;
    }

    const headers = ["Transaction ID", "Date", "Recipient / Title", "Type", "Amount (INR)", "Auth Method", "Status"];
    const rows = transactions.map((t) => [
      t.transactionId || t._id,
      new Date(t.createdAt).toISOString(),
      `"${(t.recipientName || "").replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.authMethod || "PALM_BIOMETRICS",
      t.status || "COMPLETED",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PalmPay_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction statement exported as CSV!");
  };

  const filtered = transactions.filter((tx) => {
    const match =
      (tx.recipientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.transactionId || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (typeFilter === "ALL") return match;
    return match && tx.type === typeFilter;
  });

  // Group by Date: "Today", "Yesterday", "Earlier"
  const groupTransactions = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { Today: [], Yesterday: [], Earlier: [] };

    list.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      txDate.setHours(0, 0, 0, 0);

      if (txDate.getTime() === today.getTime()) {
        groups.Today.push(tx);
      } else if (txDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(tx);
      } else {
        groups.Earlier.push(tx);
      }
    });

    return groups;
  };

  const grouped = groupTransactions(filtered);

  return (
    <MobileFrame showBottomNav={true}>
      <Header
        title="Transactions"
        subtitle="Biometric Payment History"
        showBack={true}
        backTo="/dashboard"
        rightActions={
          <button
            className="btn-icon"
            onClick={exportCSV}
            title="Download CSV Statement"
            aria-label="Download CSV Statement"
          >
            <Download size={18} />
          </button>
        }
      />

      {/* SEARCH AND TYPE FILTER */}
      <div style={{ margin: "10px 0 14px" }}>
        <div className="search-input-wrapper" style={{ marginBottom: "10px" }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search payees, Starbucks, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "38px" }}
          />
        </div>

        <div className="drawer-filter-bar" style={{ padding: 0 }}>
          {[
            { key: "ALL", label: "All" },
            { key: "PALM_PAYMENT", label: "Palm Pay" },
            { key: "WALLET_TOPUP", label: "Top-Up" },
            { key: "POS_PAYMENT", label: "POS" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`pill-tab ${typeFilter === tab.key ? "active" : ""}`}
              onClick={() => setTypeFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonTransactionList count={5} />
      ) : filtered.length === 0 ? (
        <div className="empty-state-box" style={{ padding: "50px 10px" }}>
          <Inbox size={42} className="text-muted" style={{ marginBottom: "10px" }} />
          <h4>No transactions recorded</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
            Make your first contactless palm payment to see it here.
          </p>
          <button className="btn-primary" onClick={() => navigate("/pay")}>
            Pay with Palm
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={label}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
                  {label}
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((tx) => {
                    const isTopUp = tx.type === "WALLET_TOPUP";
                    const isWithdraw = tx.type === "WITHDRAWAL";
                    const isPos = tx.type === "POS_PAYMENT";

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
                    } else if (isPos) {
                      icon = <Store size={18} />;
                      avatarBg = "var(--accent-purple)";
                      iconColor = "#9333ea";
                    }

                    const title = tx.recipientName || (
                      isTopUp ? "Wallet Deposit" :
                      isWithdraw ? "Bank Withdrawal" :
                      isPos ? "POS Terminal Checkout" :
                      "Palm Payment"
                    );

                    return (
                      <div key={tx._id || tx.transactionId} className="tx-compact-item" style={{ cursor: "default" }}>
                        <div className="tx-compact-left">
                          <div className="tx-avatar" style={{ background: avatarBg, color: iconColor }}>
                            {icon}
                          </div>
                          <div className="tx-compact-info">
                            <h5>{title}</h5>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {tx.matchScore ? ` • ${tx.matchScore}% Match` : ""}
                            </span>
                          </div>
                        </div>

                        <div
                          className="tx-compact-amount"
                          style={{
                            color: isTopUp ? "var(--color-success)" : "var(--text-primary)",
                            fontWeight: "800",
                          }}
                        >
                          {isTopUp ? "+ " : "- "}
                          {formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MobileFrame>
  );
}