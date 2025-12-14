import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import TopSearchBar from "@/components/navigation/TopSearchBar";
import MapSheet from "@/components/ui/MapSheet";
import MapCanvas from "@/components/map/MapCanvas";

export default function MainLayout() {
  const location = useLocation();
  const isMapPage = location.pathname === "/";
  const navRef = useRef<HTMLDivElement>(null);

  // --- DYNAMIC HEIGHT CALCULATION ---
  // This measures the Bottom Nav height and updates a CSS variable
  useEffect(() => {
    if (!navRef.current) return;

    const updateHeight = () => {
      const height = navRef.current?.offsetHeight || 0;
      // We set this on 'document.body' so the Portal (Drawer) can read it
      document.body.style.setProperty("--nav-height", `${height}px`);
    };

    // 1. Initial Measure
    updateHeight();

    // 2. Observer (Updates if nav size changes due to content/device)
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    // FLEX COLUMN: Content takes remaining space, Nav takes what it needs
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      {/* LAYER A: CONTENT AREA (Grows to fill space: flex-1) */}
      <div className="relative flex-1 overflow-hidden">
        {/* Map Background */}
        {isMapPage && (
          <div className="absolute inset-0 z-0">
            <MapCanvas />
          </div>
        )}

        {/* Page Content */}
        <div
          className={`relative z-10 w-full h-full ${
            !isMapPage ? "bg-white overflow-y-auto" : "pointer-events-none"
          }`}
        >
          {isMapPage && (
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
              <TopSearchBar />
            </div>
          )}
          <Outlet />
        </div>

        {/* The Sheet lives here conceptually */}
        <MapSheet />
      </div>

      {/* LAYER B: NAVIGATION AREA (Natural Height) */}
      {/* We add a ref here to measure it */}
      <div
        ref={navRef}
        className="z-50 bg-white border-t border-gray-200 shrink-0 relative"
      >
        <BottomNav />
      </div>
    </div>
  );
}
