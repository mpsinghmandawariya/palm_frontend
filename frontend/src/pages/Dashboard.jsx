import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/wallet");

      setWallet(response.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("palmPayToken");
        localStorage.removeItem("palmPayUser");

        navigate("/");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const logout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");

    navigate("/");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>

        <p>Loading your wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Something went wrong</h2>

        <p>{error}</p>

        <button onClick={loadWallet}>
          Try Again
        </button>
      </div>
    );
  }

  const user = wallet?.user;
  const walletData = wallet?.wallet;

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="brand">

          <div className="brand-icon">
            🖐
          </div>

          <div>
            <h2>Palm Pay</h2>

            <p>Secure payments</p>
          </div>

        </div>


        <div className="header-user">

          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="user-info">

            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.mobile}
            </span>

          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <main className="dashboard-content">

        <div className="welcome-section">

          <div>

            <h1>
              Good morning, {user?.name?.split(" ")[0]} 👋
            </h1>

            <p>
              Here's what's happening with your wallet.
            </p>

          </div>

        </div>


        {/* WALLET */}

        <section className="wallet-card">

          <div className="wallet-top">

            <div>
              <p className="wallet-label">
                Available Balance
              </p>

              <h2>
                {formatCurrency(
                  walletData?.balance
                )}
              </h2>
            </div>


            <div className="wallet-status">

              <span>●</span>

              Active

            </div>

          </div>


          <div className="wallet-bottom">

            <span>
              Palm Pay Wallet
            </span>

            {walletData?.palmRegistered ? (
              <span className="verified">
                🖐 Palm Verified ✓
              </span>
            ) : (
              <button
                className="register-palm-small"
                onClick={() =>
                  navigate("/palm-register")
                }
              >
                Register Palm
              </button>
            )}

          </div>

        </section>


        {/* QUICK ACTIONS */}

        <section className="dashboard-section">

          <h2>Quick Actions</h2>

          <div className="quick-actions">

            <button
              onClick={() =>
                navigate("/send-money")
              }
              className="action-card"
            >

              <div className="action-icon">
                💸
              </div>

              <div>
                <strong>
                  Send Money
                </strong>

                <span>
                  Pay someone
                </span>
              </div>

            </button>


           <button
  onClick={() =>
    navigate("/pay-with-palm")
  }
  className="action-card"
>
  <div className="action-icon">
    🖐
  </div>

  <div>
    <strong>
      Pay With Palm
    </strong>

    <span>
      Secure payment
    </span>
  </div>
</button>


            <button
              onClick={() =>
                navigate("/transactions")
              }
              className="action-card"
            >

              <div className="action-icon">
                📜
              </div>

              <div>
                <strong>
                  Transactions
                </strong>

                <span>
                  View history
                </span>
              </div>

            </button>


            <button
              onClick={() =>
                navigate("/profile")
              }
              className="action-card"
            >

              <div className="action-icon">
                👤
              </div>

              <div>
                <strong>
                  Profile
                </strong>

                <span>
                  Account details
                </span>
              </div>

            </button>

          </div>

        </section>


        {/* PALM STATUS */}

        <section className="palm-dashboard-card">

          <div className="palm-dashboard-icon">
            🖐
          </div>

          <div className="palm-dashboard-info">

            <h3>
              Palm Authentication
            </h3>

            <p>
              {walletData?.palmRegistered
                ? "Your palm is registered and ready for secure authentication."
                : "Register your palm to enable biometric authentication."}
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/palm-register")
            }
          >
            {walletData?.palmRegistered
              ? "Manage"
              : "Register"}
          </button>

        </section>


        {/* RECENT TRANSACTIONS */}

        <section className="dashboard-section">

          <div className="section-heading">

            <h2>
              Recent Transactions
            </h2>

            <button
              onClick={() =>
                navigate("/transactions")
              }
            >
              View All →
            </button>

          </div>


          <div className="empty-transactions">

            <div>
              📜
            </div>

            <h3>
              No transactions yet
            </h3>

            <p>
              Your recent payments will appear here.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}