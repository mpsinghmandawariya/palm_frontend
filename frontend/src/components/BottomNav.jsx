import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="bottom-nav-dock">
      <button
        className={`nav-dock-btn ${currentPath === "/dashboard" ? "active" : ""}`}
        onClick={() => navigate("/dashboard")}
      >
        <span className="nav-dock-icon">🏠</span>
      </button>

      <button
        className={`nav-dock-btn ${currentPath === "/transactions" ? "active" : ""}`}
        onClick={() => navigate("/transactions")}
      >
        <span className="nav-dock-icon">📋</span>
      </button>

      {/* FLOATING CENTER PALM SCAN BUTTON */}
      <button
        className="nav-center-scan-btn"
        onClick={() => navigate("/pay-with-palm")}
        title="Pay with Palm"
      >
        🖐
      </button>

      <button
        className={`nav-dock-btn ${currentPath === "/receive-money" ? "active" : ""}`}
        onClick={() => navigate("/receive-money")}
      >
        <span className="nav-dock-icon">📥</span>
      </button>

      <button
        className={`nav-dock-btn ${currentPath === "/profile" ? "active" : ""}`}
        onClick={() => navigate("/profile")}
      >
        <span className="nav-dock-icon">👤</span>
      </button>
    </nav>
  );
}
