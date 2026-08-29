import BottomNav from "./BottomNav";

export default function MobileFrame({ children, showBottomNav = false }) {
  return (
    <div className="app-viewport">
      {/* 9:41 STATUS BAR */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="status-bar-icons">
          <span>📶</span>
          <span>5G</span>
          <span>🔋</span>
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
