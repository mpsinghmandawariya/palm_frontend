import { PieChart, TrendingUp } from "lucide-react";

export default function SpendingChart({ transactions = [] }) {
  // Aggregate category spending
  const categoryTotals = transactions
    .filter((t) => t.type !== "WALLET_TOPUP")
    .reduce((acc, t) => {
      const cat = t.category || "General";
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const categories = [
    { label: "Bills & Utilities", color: "#3b82f6", amount: categoryTotals["Bills & Utilities"] || categoryTotals["Electricity"] || 1450 },
    { label: "Direct Transfers", color: "#10b981", amount: categoryTotals["Transfer"] || categoryTotals["Payment"] || 2340 },
    { label: "Merchant & Retail", color: "#f59e0b", amount: categoryTotals["Retail"] || categoryTotals["Shopping"] || 890 },
    { label: "AutoPay Mandates", color: "#8b5cf6", amount: categoryTotals["AutoPay"] || 450 },
  ];

  const overall = totalSpent > 0 ? totalSpent : 5130;

  return (
    <div className="analytics-card-widget">
      <div className="analytics-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="icon-badge-round" style={{ background: "var(--bg-subtle)" }}>
            <TrendingUp size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700" }}>Monthly Spending Analytics</h4>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Categorized expense distribution</span>
          </div>
        </div>
        <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>
          ₹{overall.toLocaleString("en-IN")}
        </strong>
      </div>

      {/* MULTI-SEGMENT PROGRESS BAR */}
      <div className="multi-progress-bar">
        {categories.map((c) => {
          const pct = Math.max(8, Math.round((c.amount / overall) * 100));
          return (
            <div
              key={c.label}
              className="progress-segment"
              style={{ width: `${pct}%`, backgroundColor: c.color }}
              title={`${c.label}: ₹${c.amount} (${pct}%)`}
            />
          );
        })}
      </div>

      {/* CATEGORY LEGEND */}
      <div className="category-legend-grid">
        {categories.map((c) => (
          <div key={c.label} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: c.color }} />
            <span className="legend-label">{c.label}</span>
            <span className="legend-val">₹{c.amount.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
