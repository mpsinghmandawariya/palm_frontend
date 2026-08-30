import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PalmRegister from "./pages/PalmRegister.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PayAmount from "./pages/PayAmount.jsx";
import PayScan from "./pages/PayScan.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Phase 2 Merchant POS Pages
import POSHome from "./pages/POSHome.jsx";
import POSScan from "./pages/POSScan.jsx";
import POSReceipt from "./pages/POSReceipt.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC AUTH ROUTES */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* PHASE 1: CUSTOMER WEB APP ROUTES */}
            <Route
              path="/palm-register"
              element={
                <ProtectedRoute>
                  <PalmRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay"
              element={
                <ProtectedRoute>
                  <PayAmount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay/scan"
              element={
                <ProtectedRoute>
                  <PayScan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay-with-palm"
              element={
                <ProtectedRoute>
                  <PayAmount />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* PHASE 2: MERCHANT POS WEB APP ROUTES */}
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <POSHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/scan"
              element={
                <ProtectedRoute>
                  <POSScan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/receipt"
              element={
                <ProtectedRoute>
                  <POSReceipt />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
