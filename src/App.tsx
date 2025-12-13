// --- IMPORTS ---
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

// --- PAGE IMPORTS ---
// WE IMPORT THE PAGES WE CREATED EARLIER
import Home from "@/pages/Home";
import Forum from "@/pages/Forum";
import History from "@/pages/History";
import Account from "@/pages/Account";
import Auth from "@/pages/Auth";

export default function App() {
  return (
    // --- ROUTER CONFIGURATION ---
    <Routes>
      {/* PUBLIC ROUTE: LOGIN PAGE */}
      {/* THIS IS OUTSIDE THE 'MAIN LAYOUT' SO IT DOESNT SHOW THE NAV BAR */}
      <Route path="/auth" element={<Auth />} />

      {/* PROTECTED ROUTES: THE MAIN APP */}
      {/* THESE PAGES SHARE THE MAP BACKGROUND AND BOTTOM NAV */}
      <Route element={<MainLayout />}>
        {/* PATH: "/" -> HOME PAGE (MAP VIEW) */}
        <Route path="/" element={<Home />} />

        {/* PATH: "/community" -> FORUM PAGE */}
        <Route path="/community" element={<Forum />} />

        {/* PATH: "/activity" -> HISTORY PAGE */}
        <Route path="/activity" element={<History />} />

        {/* PATH: "/account" -> SETTINGS PAGE */}
        <Route path="/account" element={<Account />} />
      </Route>

      {/* FALLBACK ROUTE */}
      {/* IF USER TYPES A GARBAGE URL, SEND THEM BACK HOME */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
