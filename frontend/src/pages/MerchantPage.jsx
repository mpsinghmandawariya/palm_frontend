import { useEffect, useState } from "react";
import { Store, QrCode, CreditCard, ArrowUpRight, Copy, Check, Download, RefreshCw, CheckCircle2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { SkeletonCard, SkeletonTable } from "../components/SkeletonLoader";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function MerchantPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/merchant");
      setData(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load merchant data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const merchant = data?.merchant;
  const sales = data?.sales || [
    {
      _id: "sale-1",
      amount: 130,
      recipientName: "Retail Store Checkout",
      createdAt: new Date().toISOString(),
      transactionId: "PALM-TX-8921-992",
      status: "COMPLETED",
    },
    {
      _id: "sale-2",
      amount: 450,
      recipientName: "Store Point of Sale",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      transactionId: "PALM-TX-8920-112",
      status: "COMPLETED",
    },
  ];

  const copyQrCode = () => {
    navigator.clipboard.writeText(merchant?.merchantQrCode || "PALM-QR-TERMINAL-1");
    setCopied(true);
    toast.success("Merchant POS ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout
      title="Merchant Commerce & POS Terminal"
      subtitle="Point-of-sale settlements, payment QR generation & sales ledger"
      activeNav="merchant"
    >
      <div className="kpi-grid-container" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Sales Volume</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-green)" }}>
              <CreditCard size={18} color="#16a34a" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number">
              ₹{Number(merchant?.totalSalesVolume || 12450).toLocaleString("en-IN")}
            </h3>
            <span className="trend-badge positive">+18.4%</span>
          </div>
          <span className="kpi-footnote">Gross sales processed via Palm Pay</span>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Settlement Account</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-blue)" }}>
              <ArrowUpRight size={18} color="#0284c7" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number" style={{ fontSize: "18px" }}>
              {merchant?.settlementAccount || "HDFC Bank (A/C **9821)"}
            </h3>
            <span className="trend-badge positive">
              <CheckCircle2 size={12} /> Verified
            </span>
          </div>
          <span className="kpi-footnote">Daily automated T+0 bank settlement</span>
        </div>

        <div className="kpi-metric-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Store Status</span>
            <div className="kpi-icon-box" style={{ background: "var(--accent-purple)" }}>
              <Store size={18} color="#9333ea" />
            </div>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-number" style={{ fontSize: "20px" }}>
              {merchant?.businessName || "Samantha's Store"}
            </h3>
            <span className="trend-badge positive">Live POS</span>
          </div>
          <span className="kpi-footnote">Category: {merchant?.category || "Retail & Commerce"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", marginTop: "24px" }}>
        {/* POS QR CODE TERMINAL CARD */}
        <div className="enterprise-card-box" style={{ textAlign: "center", padding: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>Merchant Contactless POS Code</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "20px" }}>
            Display at checkout counter for instant customer payments
          </p>

          <div style={{
            background: "var(--bg-subtle)",
            border: "2px dashed var(--border-light)",
            borderRadius: "24px",
            padding: "24px",
            maxWidth: "220px",
            margin: "0 auto 20px"
          }}>
            <div style={{
              width: "160px",
              height: "160px",
              background: "#ffffff",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "var(--shadow-subtle)",
            }}>
              <QrCode size={110} color="#111111" strokeWidth={1.5} />
            </div>
            <strong style={{ fontSize: "13px", fontFamily: "monospace", display: "block", color: "var(--text-primary)" }}>
              {merchant?.merchantQrCode || "PALM-QR-SAMANTHA"}
            </strong>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button className="btn-primary" onClick={copyQrCode} style={{ padding: "8px 16px", fontSize: "13px" }}>
              {copied ? <Check size={14} style={{ marginRight: "4px" }} /> : <Copy size={14} style={{ marginRight: "4px" }} />}
              {copied ? "Copied!" : "Copy POS ID"}
            </button>
            <button className="btn-outline" onClick={() => toast.info("Printing Merchant QR Standee...")} style={{ padding: "8px 16px", fontSize: "13px" }}>
              <Download size={14} style={{ marginRight: "4px" }} /> Download Standee
            </button>
          </div>
        </div>

        {/* SETTLEMENTS & SALES LEDGER TABLE */}
        <div className="enterprise-card-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Recent POS Sales</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Instant credit checkout receipts</p>
            </div>
            <button className="btn-outline" onClick={fetchMerchantData} style={{ padding: "6px 12px", fontSize: "12px" }}>
              <RefreshCw size={13} style={{ marginRight: "4px" }} /> Refresh
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={3} cols={3} />
          ) : (
            <div className="table-responsive">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Time</th>
                    <th>Gross Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <strong style={{ fontSize: "13px", display: "block" }}>{s.transactionId}</strong>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.recipientName}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "13px", color: "var(--color-success)" }}>
                          + ₹{Number(s.amount).toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td>
                        <span className="badge-pill badge-success">Settled</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
