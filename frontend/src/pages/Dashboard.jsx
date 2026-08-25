import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("palmPayUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const logout = () => {
    localStorage.removeItem("palmPayToken");
    localStorage.removeItem("palmPayUser");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div>
          <div className="logo">Palm Pay</div>
          <h1>Welcome, {user?.name || "User"}</h1>
          <p className="subtitle">{user?.email || user?.mobile}</p>
        </div>

        <div>
          <h2>Wallet Balance</h2>
          <div className="balance">
            Rs. {Number(user?.walletBalance || 0).toLocaleString("en-IN")}
          </div>
        </div>

        <div>
          <h2>Palm Status</h2>
          <p>{user?.palmRegistered ? "Registered" : "Not registered"}</p>
        </div>

        <div className="dashboard-actions">
          <button className="secondary-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
