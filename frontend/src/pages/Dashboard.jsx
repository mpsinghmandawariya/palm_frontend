import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import { EasyPayLogo, PromoDealIllustration } from "../components/Illustrations";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Top-Up Modal State
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("1000");
  const [topUpLoading, setTopUpLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const walletResponse = await API.get("/wallet");
      setWallet(walletResponse.data);

      const txResponse = await API.get("/transactions");
      setRecentTransactions(txResponse.data.transactions || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("palmPayToken");
        localStorage.removeItem("palmPayUser");
        navigate("/");
        return;
      }
      setError(err.response?.data?.message || "Unable to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setTopUpLoading(true);
    try {
      const response = await API.post("/wallet/top-up", { amount: Number(topUpAmount) });
      if (response.data?.success) {
        setShowTopUp(false);
        loadDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Top up failed.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleServiceClick = (serviceName, icon) => {
    // Dynamically route to payment with preset service metadata
    navigate("/pay-with-palm", {
      state: {
        recipientName: `${serviceName} Utility`,
        recipientPhone: `service.${serviceName.toLowerCase()}@easypay`,
        avatar: icon,
      },
    });
  };

  const user = wallet?.user;
  const walletData = wallet?.wallet;

  return (
    <MobileFrame showBottomNav={true}>
      {/* SCREEN 2: HEADER BAR */}
      <div className="dashboard-header-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EasyPayLogo size={24} />
          <strong style={{ fontSize: "17px", letterSpacing: "-0.02em" }}>EasyPay</strong>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px", cursor: "pointer" }} onClick={() => navigate("/receive-money")}>
            🔍
          </span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#111111",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile")}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
        </div>
      </div>

      {/* DYNAMIC BALANCE HEADER */}
      <div className="dashboard-balance-card">
        <div className="balance-greeting">
          <h3>Hi, {user?.name?.split(" ")[0] || "Samantha"}</h3>
          <span>Your available balance</span>
        </div>
        <div className="balance-large-amount">
          {loading ? "..." : formatCurrency(walletData?.balance)}
        </div>
      </div>

      {/* SOLID BLACK ACTION PILL BAR */}
      <div className="action-pill-bar">
        <button className="action-pill-item" onClick={() => setShowTopUp(true)}>
          <div className="action-pill-icon">➕</div>
          <span>Top Up</span>
        </button>

        <button
          className="action-pill-item"
          onClick={() => navigate("/pay-with-palm", { state: { recipientName: "Nayantara V", recipientPhone: "+91 8050530XXX", avatar: "👩🏻" } })}
        >
          <div className="action-pill-icon">✈️</div>
          <span>Send</span>
        </button>

        <button className="action-pill-item" onClick={() => navigate("/receive-money")}>
          <div className="action-pill-icon">💳</div>
          <span>Withdraw</span>
        </button>

        <button
          className="action-pill-item hero"
          onClick={() => navigate("/pay-with-palm", { state: { recipientName: "Nayantara V", recipientPhone: "+91 8050530XXX", avatar: "👩🏻" } })}
        >
          <div className="action-pill-icon">🖐</div>
          <span>Palm Pay</span>
        </button>
      </div>

      {/* 8-SERVICE ICON GRID */}
      <div className="service-icon-grid">
        <div className="service-grid-item" onClick={() => handleServiceClick("Internet", "🌐")}>
          <div className="service-circle-icon">🌐</div>
          <span className="service-grid-label">Internet</span>
        </div>

        <div className="service-grid-item" onClick={() => handleServiceClick("Water", "💧")}>
          <div className="service-circle-icon">💧</div>
          <span className="service-grid-label">Water</span>
        </div>

        <div className="service-grid-item" onClick={() => handleServiceClick("Electricity", "⚡")}>
          <div className="service-circle-icon">⚡</div>
          <span className="service-grid-label">Electricity</span>
        </div>

        <div className="service-grid-item" onClick={() => handleServiceClick("TV Cable", "📺")}>
          <div className="service-circle-icon">📺</div>
          <span className="service-grid-label">TV Cable</span>
        </div>

        <div className="service-grid-item" onClick={() => handleServiceClick("Vehicle", "🚗")}>
          <div className="service-circle-icon">🚗</div>
          <span className="service-grid-label">Vehicle</span>
        </div>

        <div className="service-grid-item" onClick={() => handleServiceClick("Rent Bill", "🏠")}>
          <div className="service-circle-icon">🏠</div>
          <span className="service-grid-label">Rent Bill</span>
        </div>

        <div className="service-grid-item" onClick={() => navigate("/palm-register")}>
          <div className="service-circle-icon">🖐</div>
          <span className="service-grid-label">Palm ID</span>
        </div>

        <div className="service-grid-item" onClick={() => navigate("/transactions")}>
          <div className="service-circle-icon">▦</div>
          <span className="service-grid-label">More</span>
        </div>
      </div>

      {/* 50% OFF SUMMER DEAL PROMO BANNER */}
      <div
        className="promo-banner-card"
        onClick={() => navigate("/pay-with-palm", { state: { recipientName: "Summer Sale Mart", recipientPhone: "promo.summer@easypay", avatar: "🛍️" } })}
      >
        <div className="promo-text">
          <strong>50% OFF</strong>
          <h4>Summer special deal</h4>
          <p>Get discount for every transaction</p>
        </div>
        <div className="promo-illustration">
          <PromoDealIllustration />
        </div>
      </div>

      {/* DYNAMIC RECENT TRANSACTIONS */}
      <div className="section-header-row">
        <h3>Recent Transaction</h3>
        <button onClick={() => navigate("/transactions")}>See All</button>
      </div>

      {recentTransactions.length === 0 ? (
        <div
          className="tx-compact-item"
          onClick={() => navigate("/pay-with-palm", { state: { recipientName: "Raj K", recipientPhone: "+91 9422019XXX", avatar: "🎩" } })}
        >
          <div className="tx-compact-left">
            <div className="tx-avatar">🎩</div>
            <div className="tx-compact-info">
              <h5>Raj K</h5>
              <span>February 24, 2022</span>
            </div>
          </div>
          <div className="tx-compact-amount">₹240.00</div>
        </div>
      ) : (
        recentTransactions.slice(0, 3).map((tx) => (
          <div
            key={tx._id}
            className="tx-compact-item"
            onClick={() => navigate("/transactions")}
          >
            <div className="tx-compact-left">
              <div className="tx-avatar">
                {tx.type === "WALLET_TOPUP" ? "➕" : "🖐"}
              </div>
              <div className="tx-compact-info">
                <h5>{tx.recipientName || "Palm Payment"}</h5>
                <span>{new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
            <div className="tx-compact-amount" style={{ color: tx.type === "WALLET_TOPUP" ? "#16a34a" : "#111111" }}>
              {tx.type === "WALLET_TOPUP" ? "+ " : "- "}
              {formatCurrency(tx.amount)}
            </div>
          </div>
        ))
      )}

      {/* DYNAMIC TOP-UP MODAL */}
      {showTopUp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100,
          }}
          onClick={() => setShowTopUp(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "32px",
              width: "100%",
              maxWidth: "380px",
              padding: "30px 24px",
              boxShadow: "var(--shadow-pop)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#f8f6f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 12px" }}>
              ➕
            </div>
            <h2 style={{ fontSize: "20px", marginBottom: "6px" }}>Top Up Wallet</h2>
            <p style={{ color: "#767676", fontSize: "13px", marginBottom: "20px" }}>Add demo money to your EasyPay balance</p>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
              {["500", "1000", "2000", "5000"].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "14px",
                    fontSize: "13px",
                    fontWeight: "700",
                    background: topUpAmount === amt ? "#111111" : "#f8f6f2",
                    color: topUpAmount === amt ? "#ffffff" : "#111111",
                    border: "1px solid #ece7df",
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <form onSubmit={handleTopUpSubmit}>
              <input
                type="number"
                min="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                style={{ fontSize: "22px", textAlign: "center", fontWeight: "800", marginBottom: "16px" }}
                required
              />

              <button className="btn-black" type="submit" disabled={topUpLoading} style={{ marginBottom: "10px" }}>
                {topUpLoading ? "Adding Funds..." : `Add ₹${topUpAmount} to Wallet`}
              </button>

              <button type="button" className="btn-outline" onClick={() => setShowTopUp(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}