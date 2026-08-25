import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ReceiveMoney() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await API.get("/wallet");

        setUser(response.data.user);
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  const generateRequest = () => {
    setError("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const randomNumber =
      Math.floor(100000 + Math.random() * 900000);

    const newRequestId =
      `PP-REQ-${Date.now()}-${randomNumber}`;

    setRequestId(newRequestId);
  };

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(
        requestId
      );

      alert("Request ID copied!");
    } catch {
      alert("Unable to copy request ID.");
    }
  };

  return (
    <div className="receive-page">

      <div className="receive-card">

        <button
          className="back-link"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {!requestId ? (
          <>
            <div className="receive-icon">
              📥
            </div>

            <h1>Receive Money</h1>

            <p className="receive-subtitle">
              Share your Palm Pay details to receive
              money securely.
            </p>

            <div className="receive-info">

              <label>
                Your Palm Pay ID
              </label>

              <div className="copy-field">
                <span>
                  PP-{user?.name
                    ?.replace(/\s/g, "")
                    ?.toUpperCase()
                    ?.slice(0, 8)}
                </span>
              </div>

            </div>

            <div className="receive-info">

              <label>
                Mobile
              </label>

              <div className="info-field">
                {user?.mobile}
              </div>

            </div>

            <div className="receive-info">

              <label>
                Email
              </label>

              <div className="info-field">
                {user?.email}
              </div>

            </div>

            <div className="divider-line"></div>

            <h3>
              Request an Amount
            </h3>

            <div className="amount-input">

              <span>₹</span>

              <input
                type="number"
                min="1"
                placeholder="500"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

            </div>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <button
              className="primary-button"
              onClick={generateRequest}
            >
              Generate Request
            </button>

          </>
        ) : (
          <div className="request-success">

            <div className="success-icon">
              ✓
            </div>

            <h1>
              Payment Request Created
            </h1>

            <p>
              Request amount
            </p>

            <h2>
              ₹{Number(amount).toLocaleString("en-IN")}
            </h2>

            <div className="request-box">

              <span>
                Request ID
              </span>

              <strong>
                {requestId}
              </strong>

            </div>

            <button
              className="primary-button"
              onClick={copyRequest}
            >
              Copy Request ID
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setRequestId("");
                setAmount("");
              }}
            >
              Create Another Request
            </button>

            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>

          </div>
        )}

      </div>

    </div>
  );
}