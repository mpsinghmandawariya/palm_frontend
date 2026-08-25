import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PalmRegister from "./pages/PalmRegister";
import ReceiveMoney from "./pages/ReceiveMoney";
import PayWithPalm from "./pages/PayWithPalm";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/receive-money"
  element={
    <ProtectedRoute>
      <ReceiveMoney />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
<Route
  path="/transactions"
  element={
    <ProtectedRoute>
      <Transactions />
    </ProtectedRoute>
  }
/>
<Route
  path="/pay-with-palm"
  element={
    <ProtectedRoute>
      <PayWithPalm />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/" replace />} />
                <Route
  path="/palm-register"
  element={
    <ProtectedRoute>
      <PalmRegister />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}
