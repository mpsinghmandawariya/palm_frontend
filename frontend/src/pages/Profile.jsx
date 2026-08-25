import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await API.get("/profile");

      setUser(response.data.user);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");

    navigate("/");
  };

  const maskAadhaar = (value) => {
    if (!value) return "Not provided";

    const text = String(value);

    if (text.length <= 4) {
      return text;
    }

    return `•••• •••• ${text.slice(-4)}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="payment-spinner large" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Unable to load profile</h2>

        <p>{error}</p>

        <button onClick={loadProfile}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-container">

        <button
          className="back-link"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

        {/* PROFILE HEADER */}

        <div className="profile-header">

          <div className="profile-avatar">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <h1>{user?.name}</h1>

          <p>
            Palm Pay Account
          </p>

        </div>

        {/* PERSONAL INFORMATION */}

        <section className="profile-section">

          <h2>
            Personal Information
          </h2>

          <div className="profile-details">

            <div className="profile-row">
              <span>Full Name</span>
              <strong>
                {user?.name || "Not provided"}
              </strong>
            </div>

            <div className="profile-row">
              <span>Email</span>
              <strong>
                {user?.email || "Not provided"}
              </strong>
            </div>

            <div className="profile-row">
              <span>Mobile</span>
              <strong>
                {user?.mobile || "Not provided"}
              </strong>
            </div>

            <div className="profile-row">
              <span>Date of Birth</span>
              <strong>
                {formatDate(user?.dob)}
              </strong>
            </div>

          </div>

        </section>

        {/* ACCOUNT */}

        <section className="profile-section">

          <h2>
            Account & Security
          </h2>

          <div className="profile-details">

            <div className="profile-row">

              <span>
                Aadhaar Test ID
              </span>

              <strong>
                {maskAadhaar(
                  user?.aadhaarTestId
                )}
              </strong>

            </div>

            <div className="profile-row">

              <span>
                Wallet Balance
              </span>

              <strong className="profile-balance">
                ₹
                {Number(
                  user?.walletBalance || 0
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </strong>

            </div>

            <div className="profile-row">

              <span>
                Palm Authentication
              </span>

              <strong
                className={
                  user?.palmRegistered
                    ? "profile-success"
                    : "profile-warning"
                }
              >
                {user?.palmRegistered
                  ? "✓ Registered"
                  : "Not Registered"}
              </strong>

            </div>

            <div className="profile-row">

              <span>
                Account Created
              </span>

              <strong>
                {formatDate(
                  user?.createdAt
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* PALM */}

        <section className="profile-palm-card">

          <div className="profile-palm-icon">
            🖐
          </div>

          <div>

            <h3>
              Palm Authentication
            </h3>

            <p>
              {user?.palmRegistered
                ? "Your palm is registered and ready for payment verification."
                : "Register your palm to enable Palm Pay payments."}
            </p>

          </div>

          {!user?.palmRegistered && (
            <button
              onClick={() =>
                navigate("/palm-register")
              }
            >
              Register Palm
            </button>
          )}

        </section>

        {/* LOGOUT */}

        <button
          className="profile-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}