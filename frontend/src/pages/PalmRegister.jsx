import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../services/api";

export default function PalmRegister() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const capturePalm = async () => {
    setError("");

    if (!webcamRef.current) {
      setError("Camera is not ready.");
      return;
    }

    const image = webcamRef.current.getScreenshot();

    if (!image) {
      setError("Unable to capture palm. Please try again.");
      return;
    }

    setScanning(true);

    try {
      /*
       * For now we send the captured image to the backend.
       * Actual OpenCV/TensorFlow palm processing will be
       * connected in the next ML step.
       */

      const token = localStorage.getItem("palmPayToken");

      await API.post(
        "/palm/register",
        {
          image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Palm registration failed."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="palm-page">

      <div className="palm-card">

        {!success ? (
          <>
            <div className="palm-logo">
              🖐
            </div>

            <h1>Register Your Palm</h1>

            <p className="palm-subtitle">
              Your palm will be used for secure
              authentication and payments.
            </p>

            <div className="camera-container">

              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.9}
                mirrored={true}
                className="webcam"
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() =>
                  setError(
                    "Camera permission was denied or unavailable."
                  )
                }
              />

              <div className="palm-frame">
                <span>Place palm here</span>
              </div>

            </div>

            <div className="camera-status">
              <span
                className={
                  cameraReady
                    ? "status-dot ready"
                    : "status-dot"
                }
              />

              {cameraReady
                ? "Camera ready"
                : "Starting camera..."}
            </div>

            {scanning && (
              <div className="scanning-box">
                <div className="spinner" />

                <strong>
                  Scanning your palm...
                </strong>

                <p>
                  Please keep your palm steady.
                </p>
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <button
              className="primary-button"
              onClick={capturePalm}
              disabled={!cameraReady || scanning}
            >
              {scanning
                ? "Scanning..."
                : "Capture Palm"}
            </button>

            <button
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              Do this later
            </button>
          </>
        ) : (
          <div className="success-screen">

            <div className="success-icon">
              ✓
            </div>

            <h1>Palm Registered</h1>

            <p>
              Your palm has been successfully
              linked to your Palm Pay account.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/dashboard")}
            >
              Continue to Dashboard
            </button>

          </div>
        )}

      </div>

    </div>
  );
}