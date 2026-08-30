import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";
import MobileFrame from "../components/MobileFrame";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    pin: "1234",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const cleanPhone = (form.mobile || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: cleanPhone,
        mobile: cleanPhone,
        password: form.password,
        pin: form.pin || "1234",
      });

      const data = response.data;
      localStorage.setItem("palmPayToken", data.token);
      localStorage.setItem("palmPayUser", JSON.stringify(data.user));

      toast.success("✓ Account created! Redirecting to Palm ID enrollment...");
      navigate("/palm-register");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <button className="btn-link" onClick={() => navigate("/")}>
          ← Sign In
        </button>
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
        <div className="brand-logo-badge" style={{ width: "48px", height: "48px", margin: "0 auto 8px" }}>
          <span style={{ fontSize: "24px" }}>🖐</span>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
          Enroll once to pay with your palm everywhere
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <label className="input-label">Full Name</label>
          <div className="input-with-icon">
            <User size={16} className="input-leading-icon" />
            <input
              name="name"
              type="text"
              placeholder="e.g. Samantha Patel"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: "38px" }}
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="input-label">Email Address</label>
          <div className="input-with-icon">
            <Mail size={16} className="input-leading-icon" />
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: "38px" }}
              required
            />
          </div>
        </div>

        <div>
          <label className="input-label">Phone Number</label>
          <div className="input-with-icon">
            <Phone size={16} className="input-leading-icon" />
            <input
              name="mobile"
              type="tel"
              maxLength="10"
              placeholder="9876543210"
              value={form.mobile}
              onChange={handleChange}
              className="form-input"
              style={{ paddingLeft: "38px" }}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock size={15} className="input-leading-icon" />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: "34px" }}
                required
              />
            </div>
          </div>
          <div>
            <label className="input-label">Confirm</label>
            <div className="input-with-icon">
              <Lock size={15} className="input-leading-icon" />
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: "34px" }}
                required
              />
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: "10px" }}
        >
          {loading ? "Creating Account..." : "Create Account & Enroll Palm →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
          Already have an account?{" "}
          <strong style={{ color: "var(--text-primary)", cursor: "pointer" }} onClick={() => navigate("/")}>
            Sign In
          </strong>
        </p>
      </form>
    </MobileFrame>
  );
}