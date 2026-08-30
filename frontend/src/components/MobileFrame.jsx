import { useState, useEffect } from "react";
import { Wifi, Battery, Signal, Maximize2, Minimize2 } from "lucide-react";
import BottomNav from "./BottomNav";

export default function MobileFrame({ children, showBottomNav = false }) {
  const [timeStr, setTimeStr] = useState("9:41");
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem("palmPayExpanded") === "true";
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("palmPayExpanded", String(next));
      return next;
    });
  };

  return (
    <div className={`app-viewport ${isExpanded ? "expanded-desktop" : ""}`}>
      {/* 9:41 STATUS BAR WITH LIVE CLOCK & SYSTEM ICONS */}
      <div className="status-bar">
        <span className="status-bar-time">{timeStr}</span>
        <div className="status-bar-icons">
          <button
            className="expand-frame-toggle"
            onClick={toggleExpand}
            title={isExpanded ? "Collapse to Mobile Frame" : "Expand to Desktop View"}
            aria-label="Toggle frame size"
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <Signal size={13} />
          <Wifi size={13} />
          <Battery size={14} />
        </div>
      </div>

      {/* SCREEN CONTENT */}
      <div className="app-screen-content" style={{ paddingBottom: showBottomNav ? "90px" : "24px" }}>
        {children}
      </div>

      {/* OPTIONAL BOTTOM NAVIGATION */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
