import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  Fingerprint,
  ShieldAlert,
  TrendingUp,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { SkeletonTable } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function AdminPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/metrics");
      setData(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const metrics = data?.metrics;
  const users = data?.users || [];
  const fraudAlerts = data?.fraudAlerts || [];
  const auditLogs = data?.auditLogs || [];

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.mobile?.includes(searchUser)
  );

  return (
    <AdminLayout
      title="Platform Operations & Risk Control"
      subtitle="Enterprise management console, biometric telemetry & fraud prevention"
      activeNav="admin"
    >
      {/* 4 PRIMARY KPI METRIC CARDS WITH TRENDS */}
      <div className="kpi-grid-container">
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Enrolled Users</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-blue)" }}>
              <Users size={18} color="#0284c7" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number">{metrics?.totalUsers || 1}</h3>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +12.5%
            </span>
          </div>
          <span className="kpi-footnote">Active biometric accounts this month</span>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Gross Transactions</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-green)" }}>
              <CreditCard size={18} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number">{metrics?.totalTransactions || 8}</h3>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +24.8%
            </span>
          </div>
          <span className="kpi-footnote">Processed across all terminals</span>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Palm Vectors Enrolled</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-purple)" }}>
              <Fingerprint size={18} color="#9333ea" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number">{metrics?.palmProfiles || 1}</h3>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> 1280-d
            </span>
          </div>
          <span className="kpi-footnote">MobileNetV2 encrypted templates</span>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Active Fraud Alerts</span>
            <div className="kpi-icon-box" style={{ background: metrics?.activeFraudAlerts > 0 ? "var(--accent-pink)" : "var(--accent-green)" }}>
              <ShieldAlert size={18} color={metrics?.activeFraudAlerts > 0 ? "#dc2626" : "#16a34a"} />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number" style={{ color: metrics?.activeFraudAlerts > 0 ? "#dc2626" : "#16a34a" }}>
              {metrics?.activeFraudAlerts || 0}
            </h3>
            <span className="trend-badge neutral">0.00% Risk</span>
          </div>
          <span className="kpi-footnote">AI Risk Engine automated blocks</span>
        </div>
      </div>

      {/* SVG TRANSACTION VOLUME & ACTIVITY TIME-SERIES CHART */}
      <div className="enterprise-card-box" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Biometric Transaction Volume (30-Day Trend)</h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Live throughput across web terminals & POS checkouts</p>
          </div>
          <button className="btn-outline" onClick={fetchAdminData} style={{ padding: "6px 12px", fontSize: "12px" }}>
            <RefreshCw size={13} style={{ marginRight: "4px" }} /> Refresh Data
          </button>
        </div>

        <div style={{ width: "100%", height: "160px", padding: "10px 0" }}>
          <svg viewBox="0 0 600 120" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="var(--border-light)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="var(--border-light)" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="var(--border-light)" />

            {/* Filled Area */}
            <path
              d="M0,100 L50,85 L100,90 L150,60 L200,75 L250,45 L300,50 L350,30 L400,40 L450,25 L500,35 L550,15 L600,20 L600,100 Z"
              fill="url(#chartGrad)"
            />
            {/* Smooth Stroke Line */}
            <path
              d="M0,100 L50,85 L100,90 L150,60 L200,75 L250,45 L300,50 L350,30 L400,40 L450,25 L500,35 L550,15 L600,20"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Highlights */}
            <circle cx="550" cy="15" r="5" fill="#10b981" />
            <circle cx="600" cy="20" r="5" fill="#10b981" />
          </svg>
        </div>
      </div>

      {/* USER MANAGEMENT & AUDIT LOG TABLES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
        {/* USERS DATA TABLE */}
        <div className="enterprise-card-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Enrolled Users ({users.length})</h3>
            <div className="search-input-wrapper" style={{ width: "180px" }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Filter users..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : (
            <div className="table-responsive">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Wallet Balance</th>
                    <th>Palm Biometrics</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id || u.email}>
                      <td>
                        <strong style={{ fontSize: "13px", display: "block" }}>{u.name}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "13px" }}>
                          ₹{Number(u.walletBalance || 0).toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td>
                        {u.palmRegistered ? (
                          <span className="badge-pill badge-success">
                            <CheckCircle2 size={12} style={{ marginRight: "3px" }} /> Active (1280d)
                          </span>
                        ) : (
                          <span className="badge-pill badge-neutral">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT AUDIT TRAIL STREAM */}
        <div className="enterprise-card-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>System Audit Trail</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Automated Security Ledger</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="empty-state-box" style={{ padding: "30px 10px" }}>
              <ShieldAlert size={28} className="text-muted" />
              <p>No audit events logged yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
              {auditLogs.map((log, idx) => (
                <div key={log._id || idx} className="audit-row-item">
                  <div className="audit-action-chip">{log.action}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500" }}>{log.details}</p>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString()} • {log.status || "SUCCESS"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
