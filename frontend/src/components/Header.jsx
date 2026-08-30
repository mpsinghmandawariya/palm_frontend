import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, HelpCircle, Activity } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import NotificationDrawer from "./NotificationDrawer";
import HelpDrawer from "./HelpDrawer";

export default function Header({
  title = "EasyPay",
  subtitle = "",
  showBack = false,
  backTo = "/dashboard",
  rightActions = null,
  showMlHealth = false,
}) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mlHealth, setMlHealth] = useState({ online: false, checking: true });

  useEffect(() => {
    if (showMlHealth) {
      const checkHealth = async () => {
        try {
          const res = await fetch("http://127.0.0.1:8000/health", { method: "GET" });
          if (res.ok) {
            setMlHealth({ online: true, checking: false });
          } else {
            setMlHealth({ online: false, checking: false });
          }
        } catch {
          setMlHealth({ online: false, checking: false });
        }
      };
      checkHealth();
    }
  }, [showMlHealth]);

  return (
    <>
      <header className="app-header-bar">
        <div className="header-left-col">
          {showBack ? (
            <button
              className="btn-icon"
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="brand-logo-badge" onClick={() => navigate("/dashboard")}>
              <span className="brand-logo-icon">🖐</span>
            </div>
          )}

          <div className="header-titles">
            <h1 className="header-page-title">{title}</h1>
            {subtitle && <span className="header-page-subtitle">{subtitle}</span>}
          </div>
        </div>

        <div className="header-right-col">
          {showMlHealth && (
            <div
              className={`ml-health-pill ${mlHealth.online ? "online" : "offline"}`}
              title={mlHealth.online ? "FastAPI MobileNetV2 Model Active" : "ML Inference Offline"}
            >
              <Activity size={12} />
              <span>{mlHealth.online ? "ML Online" : "ML Offline"}</span>
            </div>
          )}

          {rightActions}

          <button
            className="btn-icon"
            onClick={() => setShowHelp(true)}
            aria-label="Help and Support"
            title="Help & FAQ"
          >
            <HelpCircle size={18} />
          </button>

          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="btn-icon notif-bell-btn"
            onClick={() => setShowNotif(true)}
            aria-label="View notifications"
            title="Notification Center"
          >
            <Bell size={18} />
            <span className="notif-dot-badge" />
          </button>
        </div>
      </header>

      <NotificationDrawer isOpen={showNotif} onClose={() => setShowNotif(false)} />
      <HelpDrawer isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
