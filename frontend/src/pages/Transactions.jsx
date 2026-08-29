import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import API from "../services/api";

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/transactions");
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <MobileFrame showBottomNav={true}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <button className="back-header-btn" onClick={() => navigate("/dashboard")}>
          ← Transactions
        </button>
        <span style={{ fontSize: "18px" }}>🔍</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 10px", color: "#767676" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📜</div>
          <h3>No Transactions Yet</h3>
          <p style={{ fontSize: "13px", marginTop: "4px", marginBottom: "20px" }}>
            Make your first payment with palm biometrics.
          </p>
          <button className="btn-black" onClick={() => navigate("/pay-with-palm")}>
            Send Money
          </button>
        </div>
      ) : (
        <div>
          {transactions.map((tx) => (
            <div key={tx._id} className="tx-compact-item" onClick={() => navigate("/dashboard")}>
              <div className="tx-compact-left">
                <div className="tx-avatar">🖐</div>
                <div className="tx-compact-info">
                  <h5>Palm Payment</h5>
                  <span>{new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              <div className="tx-compact-amount">
                - {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileFrame>
  );
}