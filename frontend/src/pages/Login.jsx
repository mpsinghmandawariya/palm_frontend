import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import { EasyPayLogo, OnboardingIllustration } from "../components/Illustrations";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", form);
      const data = response.data;

      localStorage.setItem("palmPayToken", data.token);
      localStorage.setItem("palmPayUser", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      {!showLoginForm ? (
        /* SCREEN 1: ONBOARDING VIEW */
        <div className="onboarding-screen">
          <div className="brand-header-logo">
            <EasyPayLogo size={26} />
            <span>EasyPay</span>
          </div>

          <div className="hero-illustration-box">
            <OnboardingIllustration />
          </div>

          <div className="carousel-dots">
            <div className="dot active" />
            <div className="dot" />
            <div className="dot" />
          </div>

          <div className="onboarding-text-content">
            <h1>Easy Online Payment</h1>
            <p>Make your payment experience more better today. No additional admin fee</p>
          </div>

          <div className="onboarding-actions">
            <button className="btn-black" onClick={() => setShowLoginForm(true)}>
              Login
            </button>
            <button className="btn-outline" onClick={() => navigate("/register")}>
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 1: LOGIN FORM VIEW */
        <div style={{ paddingTop: "10px" }}>
          <button className="back-header-btn" onClick={() => setShowLoginForm(false)}>
            ← Back
          </button>

          <div style={{ textAlign: "center", margin: "20px 0 30px" }}>
            <div style={{ display: "inline-flex", marginBottom: "12px" }}>
              <EasyPayLogo size={36} />
            </div>
            <h2 style={{ fontSize: "24px" }}>Welcome Back</h2>
            <p style={{ color: "#767676", fontSize: "14px", marginTop: "4px" }}>
              Sign in to your EasyPay digital wallet
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="input-label">Email or Mobile Number</label>
              <input
                name="identifier"
                type="text"
                placeholder="e.g. user@example.com"
                value={form.identifier}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="btn-black"
              type="submit"
              disabled={loading}
              style={{ marginTop: "14px" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/register")}
            >
              Create New Account
            </button>
          </form>
        </div>
      )}
    </MobileFrame>
  );
}
