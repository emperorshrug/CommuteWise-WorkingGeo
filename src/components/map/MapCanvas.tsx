/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppStore } from "@/stores/useAppStore";
import { Crosshair, Star, ChevronRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { getVehicleTags } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// --- 1. ICONS ---
const createUserIcon = () =>
  L.divIcon({
    className: "custom-user-icon",
    html: `<div class="user-pulse"></div><div class="user-dot"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const createTerminalIcon = (type: string) => {
  const t = type.toLowerCase();
  let color = "#eab308";
  let icon = "🚌";
  if (t === "bus") {
    color = "#3b82f6";
    icon = "🚌";
  }
  if (t === "jeepney") {
    color = "#8b5cf6";
    icon = "🚌";
  }
  if (t === "e-jeepney") {
    color = "#d946ef";
    icon = "🚌";
  }
  if (t === "tricycle") {
    color = "#22c55e";
    icon = "🛺";
  }

  return L.divIcon({
    className: "custom-terminal-icon",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="transform: rotate(45deg); font-size: 16px;">${icon}</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
};

const createStopIcon = (color: string) =>
  L.divIcon({
    className: "custom-stop-icon",
    html: `<div style="background-color: white; width: 12px; height: 12px; border-radius: 50%; border: 3px solid ${color}; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

// --- 2. CONTROLLERS ---
const MapController = ({ userPos, hasCentered, setHasCentered }: any) => {
  const map = useMap();
  useEffect(() => {
    if (userPos && !hasCentered) {
      map.flyTo(userPos, 16, { animate: true, duration: 2 });
      setHasCentered(true);
    }
  }, [userPos, hasCentered, map, setHasCentered]);
  return null;
};

const RouteFitter = ({
  routePath,
}: {
  routePath: [number, number][] | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (routePath && routePath.length > 0) {
      map.flyToBounds(L.latLngBounds(routePath), {
        padding: [50, 50],
        animate: true,
      });
    }
  }, [routePath, map]);
  return null;
};

// NOTE: This does NOT use useMap, so it can live outside the container if needed,
// but we put it inside for simpler z-index handling.
const BackToTerminalControl = () => {
  const { exitRouteView, selectedTerminal } = useAppStore();
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] w-max pointer-events-auto">
      <Button
        onClick={exitRouteView}
        className="bg-slate-900 text-white shadow-xl rounded-full px-6 flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
      >
        <ArrowLeft size={16} /> Back to {selectedTerminal?.name || "Terminal"}
      </Button>
    </div>
  );
};

// NOTE: This USES useMap, so it MUST be inside <MapContainer>
const RecenterControl = ({ userPos }: { userPos: [number, number] | null }) => {
  const map = useMap();
  const handleClick = () => {
    if (userPos) map.flyTo(userPos, 17, { animate: true, duration: 1 });
  };
  return (
    <div className="absolute bottom-24 right-4 z-[1000]">
      <button
        onClick={handleClick}
        aria-label="Recenter Map"
        title="Recenter Map"
        className="bg-white text-slate-700 h-12 w-12 rounded-full shadow-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all duration-200"
      >
        <Crosshair size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
export default function MapCanvas() {
  const {
    userLocation,
    setUserLocation,
    selectTerminal,
    selectedRoute,
    routeStops,
    isRouteViewMode,
    selectedTerminal,
  } = useAppStore();

  const [hasCentered, setHasCentered] = useState(false);
  const locationRef = useRef(userLocation);

  useEffect(() => {
    locationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.accuracy < 100 || !locationRef.current)
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [setUserLocation]);

  const { data: terminals = [] } = useQuery({
    queryKey: ["terminals"],
    queryFn: async () => {
      const { data } = await supabase.from("terminals").select("*");
      return data || [];
    },
  });

  const { data: terminalRoutes = [] } = useQuery({
    queryKey: ["terminalRoutes", selectedTerminal?.id],
    queryFn: async () => {
      if (!selectedTerminal) return [];
      const { data } = await supabase
        .from("routes")
        .select("id, path_shape, color")
        .eq("terminal_id", selectedTerminal.id);
      return data || [];
    },
    enabled: !!selectedTerminal,
  });

  const parsePath = (jsonPath: any) =>
    jsonPath
      ? jsonPath.map((p: any) => [p[0], p[1]] as [number, number])
      : null;
  const activePath = selectedRoute ? parsePath(selectedRoute.path_shape) : null;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={userLocation || [14.6091, 121.0223]}
        zoom={13}
        className="w-full h-full outline-none"
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* SPIDER LEGS */}
        {!isRouteViewMode &&
          selectedTerminal &&
          terminalRoutes.map((route: any) => {
            const path = parsePath(route.path_shape);
            if (!path) return null;
            return (
              <Polyline
                key={route.id}
                positions={path}
                pathOptions={{
                  color: route.color || "#64748b",
                  weight: 4,
                  opacity: 0.4,
                  dashArray: "5, 10",
                }}
              />
            );
          })}

        {/* TERMINALS */}
        {terminals.map((terminal: any) => (
          <Marker
            key={terminal.id}
            position={[terminal.lat, terminal.lng]}
            icon={createTerminalIcon(terminal.type)}
            eventHandlers={{
              click: (e) => {
                const target = e.originalEvent?.target as HTMLElement;
                target?.blur();
                selectTerminal(terminal);
              },
            }}
          >
            <Popup className="custom-popup" minWidth={220}>
              <div className="flex flex-col gap-2 p-1">
                <h3 className="font-bold text-lg leading-tight text-slate-800">
                  {terminal.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {getVehicleTags(terminal.type).map((tag, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {terminal.address}
                </p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center text-yellow-500 font-bold">
                    <span>{terminal.rating > 0 ? terminal.rating : "New"}</span>
                    <Star size={12} fill="currentColor" className="ml-0.5" />
                    <span className="text-slate-400 font-normal ml-1">
                      ({terminal.rating_count})
                    </span>
                  </div>
                  <div className="text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                    {terminal.route_count} Routes
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                  onClick={() => selectTerminal(terminal)}
                >
                  View Terminal <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ACTIVE ROUTE */}
        {isRouteViewMode && activePath && (
          <>
            <Polyline
              positions={activePath}
              pathOptions={{
                color: selectedRoute.color || "#EF4444",
                weight: 6,
                opacity: 0.9,
              }}
            />
            <RouteFitter routePath={activePath} />
            {routeStops.map((stop: any) => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={createStopIcon(selectedRoute.color || "#EF4444")}
              >
                <Popup offset={[0, -6]}>
                  <div className="text-center">
                    <span className="font-bold text-sm block">{stop.name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                      Stop #{stop.order_index}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* LOGIC & CONTROLS (MUST BE INSIDE MapContainer) */}
        <MapController
          userPos={userLocation}
          hasCentered={hasCentered}
          setHasCentered={setHasCentered}
        />
        <RecenterControl userPos={userLocation} />
        {isRouteViewMode && <BackToTerminalControl />}
      </MapContainer>
    </div>
  );
}
