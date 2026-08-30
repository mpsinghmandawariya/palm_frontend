import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ArrowLeftRight,
  Store,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  Activity,
  ArrowLeft
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AdminLayout({
  children,
  title = "Enterprise Management Console",
  subtitle = "Real-time Platform Metrics & Biometric Risk Engine",
  activeNav = "overview",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");
    navigate("/");
  };

  const navItems = [
    { key: "admin", label: "Admin Console", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { key: "merchant", label: "Merchant POS", icon: <Store size={18} />, path: "/merchant" },
    { key: "transactions", label: "Transactions Ledger", icon: <ArrowLeftRight size={18} />, path: "/transactions" },
    { key: "security", label: "Security & Fraud Risk", icon: <ShieldAlert size={18} />, path: "/security" },
  ];

  return (
    <div className="enterprise-desktop-wrapper">
      {/* DESKTOP SIDEBAR */}
      <aside className="enterprise-sidebar">
        <div className="sidebar-brand" onClick={() => navigate("/dashboard")}>
          <div className="brand-logo-icon">🖐</div>
          <div>
            <strong style={{ fontSize: "16px", display: "block" }}>Palm Pay</strong>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Enterprise Suite
            </span>
          </div>
        </div>

        <nav className="sidebar-nav-menu">
          <span className="nav-section-title">Core Management</span>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <span className="nav-section-title" style={{ marginTop: "24px" }}>Consumer Wallet</span>
          <button className="sidebar-nav-item" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
            <span>User Wallet App</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-pill">
            <div className="user-avatar-sm">A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: "13px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Admin System
              </strong>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Super Admin</span>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Log Out" aria-label="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DESKTOP CONTENT AREA */}
      <main className="enterprise-main-panel">
        <header className="enterprise-top-header">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>{title}</h2>
            {subtitle && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{subtitle}</p>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="ml-health-pill online" title="MobileNetV2 Model Active">
              <Activity size={13} />
              <span>FastAPI Inference: 12ms</span>
            </div>

            <button className="btn-icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="btn-primary" onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", fontSize: "13px" }}>
              ← Return to Wallet
            </button>
          </div>
        </header>

        <div className="enterprise-scroll-content">
          {children}
        </div>
      </main>
    </div>
  );
}
