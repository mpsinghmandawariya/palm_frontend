import { useNavigate } from "react-router-dom";
import {
  Zap,
  Repeat,
  Gift,
  ShieldCheck,
  QrCode,
  Store,
  Fingerprint,
  LayoutDashboard,
  ArrowLeftRight
} from "lucide-react";

export default function QuickActions({ role = "user" }) {
  const navigate = useNavigate();

  const services = [
    { label: "Bills", icon: <Zap size={22} className="service-icon-svg" />, path: "/bills", bg: "var(--accent-blue)" },
    { label: "AutoPay", icon: <Repeat size={22} className="service-icon-svg" />, path: "/autopay", bg: "var(--accent-purple)" },
    { label: "Rewards", icon: <Gift size={22} className="service-icon-svg" />, path: "/savings-rewards", bg: "var(--accent-pink)" },
    { label: "Security", icon: <ShieldCheck size={22} className="service-icon-svg" />, path: "/security", bg: "var(--accent-green)" },
    { label: "Receive QR", icon: <QrCode size={22} className="service-icon-svg" />, path: "/receive-money", bg: "var(--accent-amber)" },
    { label: "Merchant", icon: <Store size={22} className="service-icon-svg" />, path: "/merchant", bg: "var(--accent-indigo)" },
    { label: "Palm ID", icon: <Fingerprint size={22} className="service-icon-svg" />, path: "/palm-register", bg: "var(--accent-teal)" },
    {
      label: role === "admin" ? "Admin" : "History",
      icon: role === "admin" ? <LayoutDashboard size={22} className="service-icon-svg" /> : <ArrowLeftRight size={22} className="service-icon-svg" />,
      path: role === "admin" ? "/admin" : "/transactions",
      bg: "var(--accent-neutral)",
    },
  ];

  return (
    <div className="service-icon-grid" role="region" aria-label="Quick Services">
      {services.map((s) => (
        <button
          key={s.label}
          className="service-grid-item"
          onClick={() => navigate(s.path)}
          aria-label={`Open ${s.label}`}
        >
          <div className="service-circle-icon" style={{ background: s.bg }}>
            {s.icon}
          </div>
          <span className="service-grid-label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
