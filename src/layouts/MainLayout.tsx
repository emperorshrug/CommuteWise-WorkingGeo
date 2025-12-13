// --- IMPORTS ---
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import TopSearchBar from "@/components/navigation/TopSearchBar";
import MapSheet from "@/components/ui/MapSheet";
import MapCanvas from "@/components/map/MapCanvas";

export default function MainLayout() {
  // --- HOOKS ---
  const location = useLocation();

  // --- LOGIC: IS MAP PAGE? ---
  // WE ONLY SHOW THE MAP BACKGROUND IF WE ARE ON THE HOME PAGE ("/")
  // OTHER PAGES LIKE "SETTINGS" MIGHT WANT A WHITE BACKGROUND
  const isMapPage = location.pathname === "/";

  return (
    // CONTAINER: FILLS THE SCREEN, PREVENTS SCROLLING ON BODY
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-50">
      {/* --- LAYER 0: THE MAP BACKGROUND --- */}
      {/* THIS IS ABSOLUTE POSITIONED SO IT SITS BEHIND EVERYTHING */}
      {isMapPage && (
        <div className="absolute inset-0 z-0">
          <MapCanvas />
        </div>
      )}

      {/* --- LAYER 1: TOP SEARCH BAR --- */}
      {/* POINTER-EVENTS-NONE LETS CLICKS PASS THROUGH TO THE MAP... */}
      {/* ...UNLESS YOU CLICK THE SEARCH BAR ITSELF (POINTER-EVENTS-AUTO) */}
      {isMapPage && (
        <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
          <div className="pointer-events-auto">
            {/* TODO: CONNECT SEARCH BAR TO ZUSTAND STORE LATER */}
            <TopSearchBar />
          </div>
        </div>
      )}

      {/* --- LAYER 2: THE PAGE CONTENT --- */}
      {/* THIS IS WHERE THE 'HOME', 'FORUM', OR 'ACCOUNT' COMPONENTS APPEAR */}
      {/* IF IT'S THE MAP PAGE, WE MAKE THIS INVISIBLE SO WE SEE THE MAP */}
      <div
        className={`flex-1 relative z-20 ${
          !isMapPage ? "bg-white overflow-y-auto pb-20" : "pointer-events-none"
        }`}
      >
        <Outlet />
      </div>

      {/* --- LAYER 3: GLOBAL OVERLAYS --- */}
      {/* THE BOTTOM SHEET (DRAWER) THAT SLIDES UP */}
      <MapSheet />

      {/* --- LAYER 4: BOTTOM NAVIGATION BAR --- */}
      {/* ALWAYS VISIBLE AT THE BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <BottomNav />
      </div>
    </div>
  );
}
