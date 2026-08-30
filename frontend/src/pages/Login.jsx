import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Lock, Mail, ArrowRight, ShieldCheck, Moon, Sun } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import { OnboardingIllustration } from "../components/Illustrations";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanId = form.identifier.trim();
      const response = await API.post("/auth/login", {
        identifier: cleanId,
        email: cleanId,
        password: form.password,
      });
      const data = response.data;

      localStorage.setItem("palmPayToken", data.token);
      localStorage.setItem("palmPayUser", JSON.stringify(data.user));

      toast.success(`✓ Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      {/* THEME TOGGLE AT TOP RIGHT */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0 0" }}>
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {!showLoginForm ? (
        /* SCREEN 1: ONBOARDING VIEW */
        <div className="onboarding-screen">
          <div className="brand-header-logo">
            <div className="brand-logo-icon">🖐</div>
            <span>Palm Pay</span>
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
            <h1>Contactless Palm Biometrics</h1>
            <p>Pay instantly with your palm print. Zero physical cards, zero passwords, 100% encrypted.</p>
          </div>

          <div className="onboarding-actions">
            <button className="btn-primary" onClick={() => setShowLoginForm(true)} style={{ width: "100%" }}>
              Sign In to Wallet
            </button>
            <button className="btn-outline" onClick={() => navigate("/register")} style={{ width: "100%" }}>
              Create New Account
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 1: LOGIN FORM VIEW */
        <div style={{ paddingTop: "10px" }}>
          <button className="btn-link" onClick={() => setShowLoginForm(false)} style={{ marginBottom: "14px" }}>
            ← Back to Intro
          </button>

          <div style={{ textAlign: "center", margin: "14px 0 24px" }}>
            <div className="icon-badge-round" style={{ width: "56px", height: "56px", margin: "0 auto 10px" }}>
              <Fingerprint size={28} />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Welcome Back</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
              Sign in to your Palm Pay enterprise wallet
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label className="input-label">Email or Mobile Number</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-leading-icon" />
                <input
                  name="identifier"
                  type="text"
                  placeholder="e.g. user@example.com or 9876543210"
                  value={form.identifier}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: "38px" }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="input-label">Account Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-leading-icon" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: "38px" }}
                  required
                />
              </div>
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: "10px", width: "100%" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/register")}
              style={{ width: "100%" }}
            >
              Create New Account
            </button>
          </form>
        </div>
      )}
    </MobileFrame>
  );
}
