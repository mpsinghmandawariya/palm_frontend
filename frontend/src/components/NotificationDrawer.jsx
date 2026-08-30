import { useState } from "react";
import { Bell, ShieldCheck, Zap, ArrowDownLeft, X, Check, Clock } from "lucide-react";

export default function NotificationDrawer({ isOpen, onClose }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Palm Biometric Login",
      description: "Biometric authentication verified on Chrome Desktop (127.0.0.1)",
      category: "SECURITY",
      timestamp: "10 mins ago",
      icon: <ShieldCheck size={18} className="text-success" />,
      read: false,
    },
    {
      id: "notif-2",
      title: "AutoPay Scheduled",
      description: "BESCOM Electricity bill of ₹450 scheduled for auto-deduction",
      category: "BILLS",
      timestamp: "1 hour ago",
      icon: <Zap size={18} className="text-warning" />,
      read: false,
    },
    {
      id: "notif-3",
      title: "Cashback Reward Credited",
      description: "₹100 Signup Cashback credited directly to your Palm Pay wallet",
      category: "PAYMENTS",
      timestamp: "Yesterday",
      icon: <ArrowDownLeft size={18} className="text-success" />,
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = activeFilter === "ALL" 
    ? notifications 
    : notifications.filter((n) => n.category === activeFilter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Notification Center">
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={20} />
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Notifications</h3>
            {unreadCount > 0 && <span className="badge-pill badge-primary">{unreadCount} New</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {unreadCount > 0 && (
              <button className="btn-text-sm" onClick={markAllRead}>
                <Check size={14} style={{ marginRight: "4px" }} /> Mark all read
              </button>
            )}
            <button className="btn-icon" onClick={onClose} aria-label="Close notifications">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="drawer-filter-bar">
          {["ALL", "PAYMENTS", "SECURITY", "BILLS"].map((cat) => (
            <button
              key={cat}
              className={`pill-tab ${activeFilter === cat ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="drawer-content">
          {filtered.length === 0 ? (
            <div className="empty-state-box">
              <Bell size={36} className="text-muted" />
              <h4>No notifications</h4>
              <p>You're all caught up on account activity.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className={`notification-item ${!item.read ? "unread" : ""}`}>
                <div className="notification-icon-box">{item.icon}</div>
                <div className="notification-text">
                  <div className="notification-title-row">
                    <strong>{item.title}</strong>
                    <span className="notification-time">
                      <Clock size={11} style={{ marginRight: "3px" }} />
                      {item.timestamp}
                    </span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
