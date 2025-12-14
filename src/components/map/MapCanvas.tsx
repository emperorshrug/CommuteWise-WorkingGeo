import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppStore } from "@/stores/useAppStore"; // Connect to our store

// --- CONFIGURATION ---
// 1. Create the Custom "Blue Dot" Icon
const createUserIcon = () => {
  return L.divIcon({
    className: "custom-user-icon", // We will style this in CSS next
    html: `<div class="user-dot"></div><div class="user-pulse"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10], // Center it
  });
};

// --- COMPONENT: RE-CENTER BUTTON ---
// A button to snap back to the user's location
const RecenterControl = ({ userPos }: { userPos: [number, number] | null }) => {
  const map = useMap();

  const handleClick = () => {
    if (userPos) {
      map.flyTo(userPos, 16, { animate: true, duration: 1.5 });
    }
  };

  return (
    <div
      className="leaflet-bottom leaflet-right"
      style={{
        marginBottom: "80px",
        marginRight: "10px",
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={handleClick}
        className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 border border-gray-300"
        title="My Location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600"
        >
          <crosshair cx="12" cy="12" r="10"></crosshair>
          <circle cx="12" cy="12" r="2"></circle> {/* Simple target icon */}
        </svg>
      </button>
    </div>
  );
};

export default function MapCanvas() {
  const { userLocation, setUserLocation } = useAppStore();
  const [isLocating, setIsLocating] = useState(true);

  // --- GPS LOGIC ---
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        // Only update if accuracy is decent (e.g., within 100 meters) to avoid "Jumps"
        if (accuracy < 100 || !userLocation) {
          setUserLocation([latitude, longitude]);
        }
        setIsLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // --- LOADING STATE ---
  // Don't show the map until we have a location (or timeout)
  if (isLocating && !userLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Locating you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={userLocation || [14.5, 121]} // Fallback only if GPS fails completely
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* THE BLUE DOT MARKER */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserIcon()}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* RE-CENTER BUTTON */}
        <RecenterControl userPos={userLocation} />
      </MapContainer>
    </div>
  );
}
