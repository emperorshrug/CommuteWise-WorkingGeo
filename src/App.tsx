import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Community from "@/pages/Forum"; // Or Community.tsx
import History from "@/pages/History";
import Account from "@/pages/Account";
import Auth from "@/pages/Auth";
import { useAppStore } from "@/stores/useAppStore";

export default function App() {
  const { isAuthenticated, hasAcceptedTerms } = useAppStore();
  const navigate = useNavigate();

  // Simple Protection Logic
  useEffect(() => {
    if (!isAuthenticated && !hasAcceptedTerms) {
      navigate("/auth");
    }
  }, [isAuthenticated, hasAcceptedTerms, navigate]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/activity" element={<History />} />
        <Route path="/account" element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
