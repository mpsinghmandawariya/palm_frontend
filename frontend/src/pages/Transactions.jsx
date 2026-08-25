import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selected, setSelected] =
    useState(null);


  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/transactions"
      );

      setTransactions(
        response.data.transactions || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTransactions();
  }, []);


  const formatAmount = (amount) => {
    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
      }
    )}`;
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  if (loading) {
    return (
      <div className="transaction-loading">
        <div className="payment-spinner large" />
        <p>Loading transactions...</p>
      </div>
    );
  }


  return (
    <div className="transactions-page">

      <div className="transactions-container">

        {/* HEADER */}

        <div className="transactions-header">

          <button
            className="back-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <h1>
            Transactions
          </h1>

          <p>
            Your Palm Pay payment history
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!error &&
          transactions.length === 0 && (

            <div className="transactions-empty">

              <div className="empty-icon">
                📜
              </div>

              <h2>
                No transactions yet
              </h2>

              <p>
                Your Palm Pay payments will
                appear here.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/pay-with-palm")
                }
              >
                Make Your First Payment
              </button>

            </div>
          )}


        {/* TRANSACTION LIST */}

        {transactions.length > 0 && (

          <div className="transaction-list">

            {transactions.map(
              (transaction) => (

                <button
                  key={transaction._id}
                  className="transaction-item"
                  onClick={() =>
                    setSelected(transaction)
                  }
                >

                  <div className="transaction-icon">
                    🖐
                  </div>


                  <div className="transaction-info">

                    <strong>
                      Palm Payment
                    </strong>

                    <span>
                      {formatDate(
                        transaction.createdAt
                      )}{" "}
                      •{" "}
                      {formatTime(
                        transaction.createdAt
                      )}
                    </span>

                  </div>


                  <div className="transaction-amount">

                    <strong>
                      -{" "}
                      {formatAmount(
                        transaction.amount
                      )}
                    </strong>

                    <span
                      className={
                        transaction.status ===
                        "COMPLETED"
                          ? "completed"
                          : "failed"
                      }
                    >
                      {transaction.status}
                    </span>

                  </div>

                </button>

              )
            )}

          </div>
        )}


        {/* DETAILS MODAL */}

        {selected && (

          <div
            className="transaction-overlay"
            onClick={() =>
              setSelected(null)
            }
          >

            <div
              className="transaction-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                ×
              </button>


              <div className="success-icon">
                ✓
              </div>


              <h2>
                Transaction Details
              </h2>


              <div className="modal-amount">
                {formatAmount(
                  selected.amount
                )}
              </div>


              <div className="transaction-details">

                <div>
                  <span>
                    Type
                  </span>

                  <strong>
                    Palm Payment
                  </strong>
                </div>


                <div>
                  <span>
                    Transaction ID
                  </span>

                  <strong>
                    {selected.transactionId}
                  </strong>
                </div>


                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      selected.createdAt
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      selected.createdAt
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Status
                  </span>

                  <strong className="completed">
                    ✓ Completed
                  </strong>
                </div>

              </div>


              <button
                className="primary-button"
                onClick={() =>
                  setSelected(null)
                }
              >
                Done
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}