export function SkeletonLine({ width = "100%", height = "16px", borderRadius = "8px", style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ height = "120px" }) {
  return (
    <div className="skeleton-card" style={{ height }}>
      <div className="skeleton-shimmer" style={{ width: "40%", height: "18px", marginBottom: "12px", borderRadius: "6px" }} />
      <div className="skeleton-shimmer" style={{ width: "70%", height: "28px", marginBottom: "14px", borderRadius: "8px" }} />
      <div className="skeleton-shimmer" style={{ width: "50%", height: "14px", borderRadius: "6px" }} />
    </div>
  );
}

export function SkeletonTransactionList({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="tx-compact-item" style={{ cursor: "default" }}>
          <div className="tx-compact-left">
            <div className="skeleton-shimmer" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
            <div className="tx-compact-info" style={{ flex: 1 }}>
              <div className="skeleton-shimmer" style={{ width: "120px", height: "14px", marginBottom: "6px", borderRadius: "4px" }} />
              <div className="skeleton-shimmer" style={{ width: "80px", height: "11px", borderRadius: "4px" }} />
            </div>
          </div>
          <div className="skeleton-shimmer" style={{ width: "70px", height: "16px", borderRadius: "4px" }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="enterprise-table-wrapper">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px" }}>
        <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton-shimmer" style={{ flex: 1, height: "16px", borderRadius: "4px" }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: "flex", gap: "12px", padding: "8px 0" }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton-shimmer" style={{ flex: 1, height: "14px", borderRadius: "4px" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
