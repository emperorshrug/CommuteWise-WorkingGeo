// --- IMPORTS ---
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Removed unused 'supabase' import if not strictly needed yet, or keep if you plan to use it.

// --- CONFIGURATION ---
const LINE_WEIGHT = 7;

// --- ASSETS FIX ---
const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};
fixLeafletIcon();

// --- TYPES ---
type LatLng = [number, number];

// --- HELPER COMPONENT: MAP UPDATER ---
const MapUpdater = ({
  route,
  userPos,
}: {
  route: LatLng[];
  userPos: LatLng | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (route.length > 0) {
      const bounds = L.latLngBounds(route.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userPos) {
      map.setView(userPos, 16);
    }
  }, [route, userPos, map]);

  return null;
};

// --- MAIN COMPONENT ---
export default function MapCanvas() {
  const [userPos, setUserPos] = useState<LatLng | null>(null);

  // Note: 'setRoute' was unused in your previous code.
  // We keep the state here but suppressing the linter until you connect the routing logic.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [route, setRoute] = useState<LatLng[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={userPos || [14.5, 121]}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapUpdater route={route} userPos={userPos} />

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "#2196F3", weight: LINE_WEIGHT, opacity: 1 }}
          />
        )}

        {userPos && (
          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
