import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PalmRegister from "./pages/PalmRegister.jsx";
import ReceiveMoney from "./pages/ReceiveMoney.jsx";
import PayWithPalm from "./pages/PayWithPalm.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";

// Enterprise Fintech Suite Pages
import BillsPage from "./pages/BillsPage.jsx";
import AutoPayPage from "./pages/AutoPayPage.jsx";
import SavingsRewardsPage from "./pages/SavingsRewardsPage.jsx";
import SecurityPage from "./pages/SecurityPage.jsx";
import MerchantPage from "./pages/MerchantPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AiAssistantWidget from "./components/AiAssistantWidget.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED SUITE ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receive-money"
          element={
            <ProtectedRoute>
              <ReceiveMoney />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay-with-palm"
          element={
            <ProtectedRoute>
              <PayWithPalm />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/palm-register"
          element={
            <ProtectedRoute>
              <PalmRegister />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />

        {/* ENTERPRISE MODULES */}
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillsPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/autopay"
          element={
            <ProtectedRoute>
              <AutoPayPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/savings-rewards"
          element={
            <ProtectedRoute>
              <SavingsRewardsPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <SecurityPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchant"
          element={
            <ProtectedRoute>
              <MerchantPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
              <AiAssistantWidget />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
