import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    aadhaarTestId: "",
    password: "",
    confirmPassword: "",
    pin: "",
    initialBalance: "5000",
  });

  const [customBalance, setCustomBalance] = useState(false);

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

      const response = await API.post(
        "/auth/register",
        form
      );

      const data = response.data;

      localStorage.setItem(
        "palmPayToken",
        data.token
      );

      localStorage.setItem(
        "palmPayUser",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="logo">
          🖐
        </div>

        <h1>Create Account</h1>

        <p className="subtitle">
          Create your Palm Pay prototype account
        </p>


        {error && (
          <div className="error">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          <h3>Personal Information</h3>

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            maxLength="10"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            required
          />


          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>

          </select>


          <h3>Identity</h3>

          <input
            name="aadhaarTestId"
            placeholder="Aadhaar Test ID"
            value={form.aadhaarTestId}
            onChange={handleChange}
            required
          />

          <small>
            Prototype only — do not enter a real Aadhaar number.
          </small>


          <h3>Security</h3>

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <input
            name="pin"
            type="password"
            placeholder="4 Digit PIN"
            maxLength="4"
            value={form.pin}
            onChange={handleChange}
            required
          />


          <h3>Prototype Wallet</h3>

          <label className="balance-option">

            <input
              type="radio"
              checked={!customBalance}
              onChange={() => {
                setCustomBalance(false);

                setForm({
                  ...form,
                  initialBalance: "5000",
                });
              }}
            />

            Use default ₹5,000

          </label>


          <label className="balance-option">

            <input
              type="radio"
              checked={customBalance}
              onChange={() => {
                setCustomBalance(true);

                setForm({
                  ...form,
                  initialBalance: "",
                });
              }}
            />

            Custom balance

          </label>


          {customBalance && (
            <input
              name="initialBalance"
              type="number"
              min="0"
              placeholder="Enter balance"
              value={form.initialBalance}
              onChange={handleChange}
            />
          )}


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <p className="login-link">

          Already have an account?

          <span onClick={() => navigate("/")}>
            Login
          </span>

        </p>

      </div>

    </div>
  );
}