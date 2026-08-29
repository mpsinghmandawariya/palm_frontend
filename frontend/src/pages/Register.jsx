import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import { EasyPayLogo } from "../components/Illustrations";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "Male",
    aadhaarTestId: "",
    password: "",
    confirmPassword: "",
    pin: "",
    initialBalance: "4590",
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.pin.length !== 4) {
      setError("Security PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", form);
      const data = response.data;

      localStorage.setItem("palmPayToken", data.token);
      localStorage.setItem("palmPayUser", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileFrame showBottomNav={false}>
      <button className="back-header-btn" onClick={() => navigate("/")}>
        ← Back
      </button>

      <div style={{ textAlign: "center", margin: "16px 0 24px" }}>
        <div style={{ display: "inline-flex", marginBottom: "8px" }}>
          <EasyPayLogo size={32} />
        </div>
        <h2 style={{ fontSize: "22px" }}>Create EasyPay Account</h2>
        <p style={{ color: "#767676", fontSize: "13px" }}>Join the contactless biometric payment network</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label className="input-label">Full Name</label>
          <input
            name="name"
            type="text"
            placeholder="e.g. Samantha Patel"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="samantha@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="input-label">Mobile Number</label>
          <input
            name="mobile"
            type="tel"
            maxLength="10"
            placeholder="9876543210"
            value={form.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label className="input-label">Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="input-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="input-label">Aadhaar / Citizen ID</label>
          <input
            name="aadhaarTestId"
            type="text"
            maxLength="12"
            placeholder="12-digit verification ID"
            value={form.aadhaarTestId}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
          <div>
            <label className="input-label">Repeat</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label className="input-label">4-Digit PIN</label>
            <input
              name="pin"
              type="password"
              maxLength="4"
              placeholder="••••"
              value={form.pin}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="input-label">Demo Balance</label>
            <input
              name="initialBalance"
              type="number"
              value={form.initialBalance}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="btn-black" type="submit" disabled={loading} style={{ marginTop: "10px" }}>
          {loading ? "Creating Wallet..." : "Agree & Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#767676", margin: "6px 0 16px" }}>
          Already have an account?{" "}
          <strong style={{ color: "#111111", cursor: "pointer" }} onClick={() => navigate("/")}>
            Sign In
          </strong>
        </p>
      </form>
    </MobileFrame>
  );
}