import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./store/useUserStore";
import { useEffect } from "react";
import LoadingSinner from "./components/LoadingSinner";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import { useCartStore } from "./store/useCartStore";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSinner />;


  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full 
          bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]"
          />
        </div>
      </div>
      <div className="relative z-50 mt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={
              !user ? (
                <LoginPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" && user?.isVerified ? (
                <AdminPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/cart"
            element={
              user && user?.isVerified ? (
                <CartPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/purchase-success"
            element={
              user && user?.isVerified ? (
                <PurchaseSuccessPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/purchase-cancel"
            element={
              user && user?.isVerified ? (
                <PurchaseCancelPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/verify-email"
            element={
              user && !user?.isVerified ? (
                <EmailVerificationPage />
              ) : user?.isVerified ? (
                <Navigate to="/" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              !user ? (
                <ForgotPasswordPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              !user ? (
                <ResetPasswordPage />
              ) : !user?.isVerified ? (
                <Navigate to="/verify-email" />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          {/* catch all routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
