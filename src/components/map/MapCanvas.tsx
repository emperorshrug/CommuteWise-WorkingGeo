/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppStore } from "@/stores/useAppStore";
import { Crosshair, Star, ChevronRight, ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { getVehicleTags } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// --- 1. ICONS ---
const createUserIcon = () =>
  L.divIcon({
    className: "custom-user-icon",
    html: `<div class="user-pulse"></div><div class="user-dot"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const createDestIcon = () =>
  L.divIcon({
    className: "custom-dest-icon",
    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -28],
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

// --- HELPER: Reverse Geocode (Nominatim) ---
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    if (!res.ok) throw new Error("Geocode failed");

    const data = await res.json();
    if (data && data.address) {
      const a = data.address;

      // 1. Identify Specific Place (Establishment)
      const establishment =
        a.amenity ||
        a.shop ||
        a.tourism ||
        a.leisure ||
        a.building ||
        a.office ||
        a.historic ||
        "";

      // 2. Identify Street / Road
      const street = a.road || a.pedestrian || a.street || "";
      const houseNumber = a.house_number ? `${a.house_number} ` : "";

      // 3. Identify Neighborhood / Barangay / District
      const neighborhood =
        a.suburb ||
        a.quarter ||
        a.neighbourhood ||
        a.district ||
        a.village ||
        "";

      // 4. Identify City / Municipality
      const city = a.city || a.town || a.municipality || "";

      // 5. Region & Postcode
      const region = a.state || a.region || "Metro Manila";
      const postcode = a.postcode || "";

      // --- FORMATTING LOGIC ---
      let formatted = "";

      // "SM City North EDSA, North Avenue..."
      if (establishment) {
        formatted += `${establishment}, `;
      }

      // "1 Sampaguita Ave, ..." OR "North Avenue..."
      if (street) {
        formatted += `${houseNumber}${street}, `;
      }

      // "Barangay Holy Spirit, ..."
      if (neighborhood && neighborhood !== city) {
        formatted += `${neighborhood}, `;
      }

      // "Quezon City, 1100 Metro Manila"
      formatted += `${city}, ${postcode} ${region}`;

      // Clean up any double commas or trailing spaces
      formatted = formatted.replace(/, ,/g, ",").replace(/,$/, "").trim();

      // Short name for the "Pill" in bottom sheet
      const shortName = neighborhood || city || "Unknown Location";

      return { formatted, neighborhood: shortName };
    }
    return { formatted: "Unknown Location", neighborhood: "Unknown Area" };
  } catch {
    return { formatted: "Location Error", neighborhood: "Unknown Area" };
  }
};

// --- 2. CONTROLLERS ---

const MapStateTracker = () => {
  const { setMapState, setCurrentMapLocationName } = useAppStore();
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );
  const map = useMap();

  useMapEvents({
    // FIX: Using 'dragend' and 'zoomend' prevents API spam during animations
    dragend: () => updateMapState(),
    zoomend: () => updateMapState(),
  });

  const updateMapState = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    setMapState([center.lat, center.lng], zoom);

    // Debounce the API call
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(async () => {
      const result = await reverseGeocode(center.lat, center.lng);
      setCurrentMapLocationName(result.neighborhood);
    }, 500);
    setTimer(newTimer);
  };

  return null;
};

// Controls centering logic
const MapController = ({ userPos }: { userPos: [number, number] | null }) => {
  const map = useMap();
  const { hasCentered, setHasCentered, searchDestination } = useAppStore();

  useEffect(() => {
    if (searchDestination) {
      map.flyTo([searchDestination.lat, searchDestination.lng], 16, {
        animate: true,
        duration: 1.5,
      });
      return;
    }

    if (userPos && !hasCentered) {
      map.flyTo(userPos, 16, { animate: true, duration: 2 });
      setHasCentered(true);
    }
  }, [userPos, hasCentered, searchDestination, map, setHasCentered]);
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

const RecenterControl = ({ userPos }: { userPos: [number, number] | null }) => {
  const map = useMap();
  const handleClick = () => {
    if (userPos) map.flyTo(userPos, 17, { animate: true, duration: 1 });
  };
  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
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
    lastMapCenter,
    lastMapZoom,
    searchDestination,
    isPickingLocation,
    setSearchDestination,
  } = useAppStore();

  const locationRef = useRef(userLocation);
  const mapRef = useRef<L.Map | null>(null);

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

  // CONFIRM PICK LOGIC
  const handleConfirmPick = async () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();

    // 1. Get readable address
    const { formatted } = await reverseGeocode(center.lat, center.lng);

    // 2. Update Search Input & Store
    setSearchDestination({
      lat: center.lat,
      lng: center.lng,
      name: formatted, // This will now appear in the text field!
    });

    toast.success("Location selected!", { duration: 2000 });
  };

  const parsePath = (jsonPath: any) =>
    jsonPath
      ? jsonPath.map((p: any) => [p[0], p[1]] as [number, number])
      : null;
  const activePath = selectedRoute ? parsePath(selectedRoute.path_shape) : null;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={lastMapCenter || userLocation || [14.6091, 121.0223]}
        zoom={lastMapZoom || 13}
        className={`w-full h-full outline-none ${
          isPickingLocation ? "cursor-crosshair" : ""
        }`}
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

        {searchDestination && !isPickingLocation && (
          <Marker
            position={[searchDestination.lat, searchDestination.lng]}
            icon={createDestIcon()}
          >
            <Popup offset={[0, -32]}>
              <div className="text-center p-1 max-w-[200px]">
                <div className="font-bold text-sm text-slate-800 mb-1">
                  Destination
                </div>
                <div className="text-xs text-slate-600 leading-tight">
                  {searchDestination.name}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

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

        {terminals.map((terminal: any) => (
          <Marker
            key={terminal.id}
            position={[terminal.lat, terminal.lng]}
            icon={createTerminalIcon(terminal.type)}
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
                  onClick={(e) => {
                    e.currentTarget.blur();
                    selectTerminal(terminal);
                  }}
                >
                  View Terminal <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

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

        {/* LOGIC & CONTROLS */}
        <MapController userPos={userLocation} />
        <MapStateTracker />
        <RecenterControl userPos={userLocation} />
      </MapContainer>

      {/* --- CENTER PIN PICKER UI --- */}
      {isPickingLocation && (
        <>
          {/* Fixed Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none pb-9">
            <MapPin
              className="h-10 w-10 text-red-600 fill-red-600 drop-shadow-xl animate-bounce"
              strokeWidth={1.5}
            />
          </div>

          {/* Instructions */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-max z-[1000] flex flex-col items-center gap-3">
            <div className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-4">
              Move map to adjust pin
            </div>
          </div>

          {/* Confirm Button */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[1000] w-full px-6 max-w-sm">
            <Button
              onClick={handleConfirmPick}
              className="w-full bg-slate-900 text-white shadow-xl h-12 text-sm font-bold"
            >
              Set Location
            </Button>
          </div>
        </>
      )}

      {isRouteViewMode && <BackToTerminalControl />}
    </div>
  );
}
