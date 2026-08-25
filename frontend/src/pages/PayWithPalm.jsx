import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function PayWithPalm() {

  const navigate = useNavigate();

  const [amount, setAmount] = useState("");

  const [stage, setStage] =
    useState("amount");

  const [payment, setPayment] =
    useState(null);

  const [error, setError] =
    useState("");


  const continuePayment = () => {

    setError("");

    const value = Number(amount);

    if (!value || value <= 0) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }

    setStage("scan");
  };


  // --------------------------------
  // Temporary palm verification
  // --------------------------------

  const verifyPalm = async () => {

    setError("");

    setStage("verifying");

    /*
      THIS IS ONLY A PLACEHOLDER.

      Later your ML system will replace
      this with actual palm verification.
    */

    setTimeout(() => {

      setStage("verified");

    }, 1500);
  };


  const completePayment = async () => {

    try {

      setError("");

      setStage("processing");


      const response = await API.post(
        "/payment/pay",
        {
          amount: Number(amount),

          // Temporary ML result
          palmVerified: true,
        }
      );


      setPayment(
        response.data.payment
      );

      setStage("success");

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Payment failed."
      );

      setStage("failed");
    }
  };


  // ================================
  // AMOUNT SCREEN
  // ================================

  if (stage === "amount") {

    return (

      <div className="payment-page">

        <div className="payment-card">

          <button
            className="back-link"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>


          <div className="payment-icon">
            💳
          </div>


          <h1>
            Pay With Palm
          </h1>


          <p className="payment-subtitle">
            Enter the amount you want to pay.
          </p>


          <label>
            Payment Amount
          </label>


          <div className="large-amount-input">

            <span>₹</span>

            <input
              type="number"
              min="1"
              placeholder="0"
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
            onClick={continuePayment}
          >
            Continue with Palm
          </button>

        </div>

      </div>

    );
  }


  // ================================
  // PALM SCAN
  // ================================

  if (
    stage === "scan" ||
    stage === "verifying"
  ) {

    return (

      <div className="payment-page">

        <div className="payment-card">

          <div className="payment-icon">
            🖐
          </div>


          <h1>
            Verify Payment
          </h1>


          <p className="payment-subtitle">
            Place your palm inside the
            frame to authorize this payment.
          </p>


          <div className="mock-palm-scanner">

            <div className="palm-circle">
              🖐
            </div>

            <div className="scanner-line"></div>

          </div>


          <div className="scan-amount">
            ₹{Number(amount).toLocaleString("en-IN")}
          </div>


          {stage === "verifying" ? (

            <div className="scan-status">

              <div className="payment-spinner"></div>

              <strong>
                Verifying palm...
              </strong>

              <p>
                Please keep your palm steady.
              </p>

            </div>

          ) : (

            <button
              className="primary-button"
              onClick={verifyPalm}
            >
              Scan Palm
            </button>

          )}


          <button
            className="back-button"
            onClick={() =>
              setStage("amount")
            }
          >
            Cancel
          </button>

        </div>

      </div>

    );
  }


  // ================================
  // VERIFIED
  // ================================

  if (stage === "verified") {

    return (

      <div className="payment-page">

        <div className="payment-card">

          <div className="verified-icon">
            ✓
          </div>


          <h1>
            Palm Verified
          </h1>


          <p className="payment-subtitle">
            Your palm has been verified.
          </p>


          <div className="payment-summary">

            <div>
              <span>
                Payment Amount
              </span>

              <strong>
                ₹{Number(amount).toLocaleString("en-IN")}
              </strong>
            </div>

          </div>


          <button
            className="primary-button"
            onClick={completePayment}
          >
            Confirm Payment
          </button>


          <button
            className="back-button"
            onClick={() =>
              setStage("scan")
            }
          >
            Scan Again
          </button>

        </div>

      </div>

    );
  }


  // ================================
  // PROCESSING
  // ================================

  if (stage === "processing") {

    return (

      <div className="payment-page">

        <div className="payment-card">

          <div className="payment-spinner large"></div>

          <h1>
            Processing Payment
          </h1>

          <p className="payment-subtitle">
            Please don't close this page.
          </p>

        </div>

      </div>

    );
  }


  // ================================
  // SUCCESS
  // ================================

  if (stage === "success") {

    return (

      <div className="payment-page">

        <div className="payment-card">

          <div className="success-icon">
            ✓
          </div>


          <h1>
            Payment Successful
          </h1>


          <div className="success-amount">
            ₹
            {payment?.amount?.toLocaleString(
              "en-IN"
            )}
          </div>


          <p className="payment-subtitle">
            Your payment was successfully
            processed.
          </p>


          <div className="payment-details">

            <div>
              <span>
                Transaction ID
              </span>

              <strong>
                {payment?.transactionId}
              </strong>
            </div>


            <div>
              <span>
                Remaining Balance
              </span>

              <strong>
                ₹
                {payment?.remainingBalance?.toLocaleString(
                  "en-IN"
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
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>

    );
  }


  // ================================
  // FAILED
  // ================================

  return (

    <div className="payment-page">

      <div className="payment-card">

        <div className="failed-icon">
          !
        </div>


        <h1>
          Payment Failed
        </h1>


        <p className="payment-subtitle">
          {error ||
            "We couldn't process your payment."}
        </p>


        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setStage("amount");
          }}
        >
          Try Again
        </button>


        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </div>

    </div>

  );
}