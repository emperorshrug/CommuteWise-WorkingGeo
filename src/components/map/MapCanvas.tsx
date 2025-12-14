import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppStore } from "@/stores/useAppStore";
import { Crosshair } from "lucide-react";

// --- 1. ICON DEFINITION ---
const createUserIcon = () => {
  return L.divIcon({
    className: "custom-user-icon",
    html: `<div class="user-pulse"></div><div class="user-dot"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// --- 2. MAP CONTROLLER (Logic) ---
const MapController = ({
  userPos,
  hasCentered,
  setHasCentered,
}: {
  userPos: [number, number] | null;
  hasCentered: boolean;
  setHasCentered: (v: boolean) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    // Center map only once when we first get a location
    if (userPos && !hasCentered) {
      map.flyTo(userPos, 16, { animate: true, duration: 2 });
      setHasCentered(true);
    }
  }, [userPos, hasCentered, map, setHasCentered]);

  return null;
};

// --- 3. RE-CENTER BUTTON (UI) ---
const RecenterControl = ({ userPos }: { userPos: [number, number] | null }) => {
  const map = useMap();

  const handleClick = () => {
    if (userPos) {
      map.flyTo(userPos, 17, { animate: true, duration: 1 });
    }
  };

  return (
    <div className="absolute bottom-24 right-4 z-[400]">
      <button
        onClick={handleClick}
        className="
          bg-white text-slate-700 
          h-12 w-12 rounded-full 
          shadow-xl border border-slate-100
          flex items-center justify-center
          hover:bg-slate-50 hover:text-blue-600
          active:scale-95 transition-all duration-200
        "
        title="Recenter Map"
      >
        <Crosshair size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function MapCanvas() {
  const { userLocation, setUserLocation } = useAppStore();
  const [isLocating, setIsLocating] = useState(true);
  const [hasCentered, setHasCentered] = useState(false);

  // REF PATTERN: Keep track of location "silently" to avoid dependency loops
  // This solves the 'unused useRef' AND the 'missing dependency' errors at once.
  const locationRef = useRef(userLocation);

  // Sync ref with state
  useEffect(() => {
    locationRef.current = userLocation;
  }, [userLocation]);

  // GPS Logic
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Use the REF to check current state without re-running the effect
        if (accuracy < 100 || !locationRef.current) {
          setUserLocation([latitude, longitude]);
        }
        setIsLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [setUserLocation]); // Safe dependency

  // Loading Screen
  if (isLocating && !userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center animate-pulse">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-3"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={userLocation || [14.6091, 121.0223]}
        zoom={13}
        className="w-full h-full outline-none"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <MapController
          userPos={userLocation}
          hasCentered={hasCentered}
          setHasCentered={setHasCentered}
        />

        <RecenterControl userPos={userLocation} />
      </MapContainer>
    </div>
  );
}
