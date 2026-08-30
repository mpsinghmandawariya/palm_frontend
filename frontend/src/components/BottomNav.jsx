import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, Fingerprint, Store, User } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="bottom-nav-dock" aria-label="Main Navigation">
      <button
        className={`nav-dock-btn ${currentPath === "/dashboard" ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
        aria-label="Dashboard Home"
      >
        <Home size={20} className="nav-dock-icon" />
        <span className="nav-dock-label">Home</span>
      </button>

      <button
        className={`nav-dock-btn ${currentPath === "/transactions" ? "active" : ""}`}
        onClick={() => navigate("/transactions")}
        aria-label="Transactions Ledger"
      >
        <ArrowLeftRight size={20} className="nav-dock-icon" />
        <span className="nav-dock-label">History</span>
      </button>

      {/* FLOATING CENTER PALM PAY BUTTON */}
      <button
        className="nav-center-scan-btn"
        onClick={() => navigate("/pay")}
        title="Pay with Palm"
        aria-label="Pay with Palm"
      >
        <Fingerprint size={26} strokeWidth={2.2} />
      </button>

      <button
        className={`nav-dock-btn ${currentPath.startsWith("/pos") ? "active" : ""}`}
        onClick={() => navigate("/pos")}
        aria-label="Merchant POS Terminal"
      >
        <Store size={20} className="nav-dock-icon" />
        <span className="nav-dock-label">POS</span>
      </button>

      <button
        className={`nav-dock-btn ${currentPath === "/profile" ? "active" : ""}`}
        onClick={() => navigate("/profile")}
        aria-label="User Profile"
      >
        <User size={20} className="nav-dock-icon" />
        <span className="nav-dock-label">Profile</span>
      </button>
    </nav>
  );
}
