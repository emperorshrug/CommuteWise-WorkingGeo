import { useState, useEffect, useMemo } from "react";
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

// --- TS-SAFE FIX FOR LEAFLET ICONS ---
// Fixes "Cannot find module" errors for .png files and prototype modifications
const fixLeafletIcon = () => {
  // ts-expect-error: _getIconUrl is a private property, we need to delete it to reset icons.
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

// --- TYPE DEFINITIONS ---
type LatLng = [number, number];

// --- STYLES (Moved out of JSX to satisfy linter) ---
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column" as const,
  },
  debugHeader: {
    padding: "10px",
    background: "#333",
    color: "#fff",
    fontSize: "12px",
  },
  mapContainer: {
    flex: 1,
  },
  loading: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// --- MATH HELPER FUNCTIONS ---

// 1. Calculate distance between two points (lat/lng) in meters
const getDistance = (pt1: LatLng, pt2: LatLng): number => {
  const R = 6371e3; // Earth radius meters
  const φ1 = (pt1[0] * Math.PI) / 180;
  const φ2 = (pt2[0] * Math.PI) / 180;
  const Δφ = ((pt2[0] - pt1[0]) * Math.PI) / 180;
  const Δλ = ((pt2[1] - pt1[1]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 2. Vector Projection: Find the closest point on segment AB to point P
const getProjectedPointOnLine = (p: LatLng, a: LatLng, b: LatLng): LatLng => {
  const x = p[0],
    y = p[1];
  const x1 = a[0],
    y1 = a[1];
  const x2 = b[0],
    y2 = b[1];

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  // Parameter t determines where on the line the projection falls
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return [xx, yy];
};

// --- COMPONENT TO CENTER MAP ON USER ---
const RecenterMap = ({ position }: { position: LatLng | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 18, { animate: true });
    }
  }, [position, map]);
  return null;
};

export default function App() {
  // State
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);

  // Fix: Initialize state with check to avoid useEffect setState error
  const [debugInfo, setDebugInfo] = useState<string>(() =>
    navigator.geolocation
      ? "Waiting for GPS..."
      : "Geolocation is not supported by your browser"
  );

  // 1. INITIAL SETUP
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const start: LatLng = [latitude, longitude];
        setUserPos(start);

        // GENERATE A TEST ROUTE: Starts at your location
        const testRoute: LatLng[] = [
          start,
          [latitude + 0.0003, longitude + 0.0003], // ~40m away
          [latitude + 0.0006, longitude + 0.0006], // ~80m away
          [latitude + 0.001, longitude + 0.001], // ~120m away (Destination)
        ];
        setRoute(testRoute);
      },
      (error) => {
        console.error("Error getting location", error);
        setDebugInfo(`GPS Error: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // 2. WATCH POSITION
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        setDebugInfo(
          `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
        );
      },
      (err) => console.error(err),
      // Fix: 'distanceFilter' removed as it is not in standard PositionOptions
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // 3. CORE LOGIC: SPLIT THE ROUTE
  const { traveledPath, remainingPath } = useMemo(() => {
    if (!userPos || route.length < 2) {
      return { traveledPath: [], remainingPath: route };
    }

    let minDistance = Infinity;
    let bestIndex = 0;
    let bestProjectedPoint: LatLng = userPos;

    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];

      const projected = getProjectedPointOnLine(userPos, start, end);
      const dist = getDistance(userPos, projected);

      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
        bestProjectedPoint = projected;
      }
    }

    const pathBefore = route.slice(0, bestIndex + 1);
    const pathAfter = route.slice(bestIndex + 1);

    return {
      traveledPath: [...pathBefore, bestProjectedPoint] as LatLng[],
      remainingPath: [bestProjectedPoint, ...pathAfter] as LatLng[],
    };
  }, [userPos, route]);

  return (
    <div style={styles.container}>
      <div style={styles.debugHeader}>{debugInfo}</div>

      {userPos ? (
        <MapContainer center={userPos} zoom={18} style={styles.mapContainer}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <RecenterMap position={userPos} />

          {/* TRAVELED PATH (Gray) */}
          <Polyline
            positions={traveledPath}
            pathOptions={{ color: "gray", weight: 8, opacity: 0.5 }}
          />

          {/* REMAINING PATH (Blue) */}
          <Polyline
            positions={remainingPath}
            pathOptions={{ color: "blue", weight: 8, opacity: 1.0 }}
          />

          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>

          {route.length > 0 && (
            <Marker position={route[route.length - 1]}>
              <Popup>Destination</Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div style={styles.loading}>Loading Map & GPS...</div>
      )}
    </div>
  );
}
