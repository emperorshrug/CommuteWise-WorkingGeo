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
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
const LINE_WEIGHT = 7;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- ASSETS ---
const fixLeafletIcon = () => {
  // ts-expect-error: Private property access needed for fix
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
interface RouteSummary {
  distance: number; // meters
  duration: number; // seconds
}

// --- STYLES ---
const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column" as const,
    fontFamily: "sans-serif",
  },
  uiOverlay: {
    position: "absolute" as const,
    zIndex: 1000,
    top: 10,
    left: 10,
    right: 10,
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  inputCard: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  statsCard: {
    position: "absolute" as const,
    zIndex: 1000,
    bottom: 30,
    left: 20,
    right: 20,
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statBig: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    color: "#333",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
  },
  etaText: {
    color: "#28a745",
    fontWeight: "bold" as const,
  },
  rightAlign: {
    textAlign: "right" as const,
  },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  mapContainer: {
    flex: 1,
  },
};

// --- MATH HELPERS ---
const getDistance = (pt1: LatLng, pt2: LatLng): number => {
  const R = 6371e3;
  const φ1 = (pt1[0] * Math.PI) / 180;
  const φ2 = (pt2[0] * Math.PI) / 180;
  const Δφ = ((pt2[0] - pt1[0]) * Math.PI) / 180;
  const Δλ = ((pt2[1] - pt1[1]) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getProjectedPoint = (p: LatLng, a: LatLng, b: LatLng): LatLng => {
  const x = p[0],
    y = p[1],
    x1 = a[0],
    y1 = a[1],
    x2 = b[0],
    y2 = b[1];
  const A = x - x1,
    B = y - y1,
    C = x2 - x1,
    D = y2 - y1;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = (A * C + B * D) / lenSq;
  if (param < 0) return [x1, y1];
  if (param > 1) return [x2, y2];
  return [x1 + param * C, y1 + param * D];
};

// --- COMPONENTS ---
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
      map.fitBounds(L.latLngBounds(route.map((p) => L.latLng(p[0], p[1]))), {
        padding: [50, 50],
      });
    } else if (userPos) {
      map.setView(userPos, 16);
    }
  }, [route, userPos, map]);
  return null;
};

// --- MAIN APP ---
export default function App() {
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [startInput, setStartInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [route, setRoute] = useState<LatLng[]>([]);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("Locating...");

  // 1. Initial GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const p: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setMsg("");
      },
      (err) => setMsg(`GPS Error: ${err.message}`),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // 2. Fetch Route Function
  const handleGetRoute = async () => {
    let startCoords: LatLng | null = null;
    let endCoords: LatLng | null = null;

    if (!startInput.trim()) {
      if (!userPos) {
        alert("Wait for GPS or enter start manually.");
        return;
      }
      startCoords = userPos;
    } else {
      const parts = startInput.split(",").map((n: string) => parseFloat(n));
      if (parts.length === 2 && !isNaN(parts[0]))
        startCoords = [parts[0], parts[1]];
    }

    const parts = destInput.split(",").map((n: string) => parseFloat(n));
    if (parts.length === 2 && !isNaN(parts[0]))
      endCoords = [parts[0], parts[1]];

    if (!startCoords || !endCoords) {
      alert("Invalid coordinates. Use format: Lat, Lng");
      return;
    }

    setLoading(true);
    setMsg("Calculating best route...");

    try {
      const { data, error } = await supabase.functions.invoke("get-route", {
        body: { start: startCoords, end: endCoords },
      });

      if (error || data.error) throw new Error(data?.error || error?.message);

      setRoute(data.path);
      setSummary(data.summary);
      setMsg("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert("Routing failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Logic: Traveled vs Remaining & Real-time Stats
  const { traveledPath, remainingPath, remainingStats } = useMemo(() => {
    if (!userPos || route.length < 2 || !summary) {
      return {
        traveledPath: [],
        remainingPath: route,
        remainingStats: summary,
      };
    }

    let minDst = Infinity;
    let idx = 0;
    let snapPt: LatLng = userPos;

    for (let i = 0; i < route.length - 1; i++) {
      const proj = getProjectedPoint(userPos, route[i], route[i + 1]);
      const d = getDistance(userPos, proj);
      if (d < minDst) {
        minDst = d;
        idx = i;
        snapPt = proj;
      }
    }

    const pathBefore = route.slice(0, idx + 1);
    const pathAfter = route.slice(idx + 1);

    const progressRatio = pathBefore.length / route.length;
    const remDist = summary.distance * (1 - progressRatio);
    const remTime = summary.duration * (1 - progressRatio);

    return {
      traveledPath: [...pathBefore, snapPt] as LatLng[],
      remainingPath: [snapPt, ...pathAfter] as LatLng[],
      remainingStats: { distance: remDist, duration: remTime },
    };
  }, [userPos, route, summary]);

  const formatTime = (sec: number) => {
    const min = Math.round(sec / 60);
    if (min > 60) return `${Math.floor(min / 60)} hr ${min % 60} min`;
    return `${min} min`;
  };

  if (!userPos && !route.length)
    return <div style={styles.loading}>{msg || "Waiting for GPS..."}</div>;

  return (
    <div style={styles.container}>
      {/* INPUTS */}
      <div style={styles.uiOverlay}>
        <div style={styles.inputCard}>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Start (Leave empty for Current Location)"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
            />
          </div>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Destination (Lat, Lng)"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
            />
            <button
              style={
                loading
                  ? { ...styles.button, ...styles.buttonDisabled }
                  : styles.button
              }
              onClick={handleGetRoute}
              disabled={loading}
            >
              {loading ? "..." : "GO"}
            </button>
          </div>
        </div>
      </div>

      {/* MAP */}
      <MapContainer
        center={userPos || [14.5, 121]}
        zoom={15}
        style={styles.mapContainer}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater route={route} userPos={userPos} />

        <Polyline
          positions={traveledPath}
          pathOptions={{ color: "#888", weight: LINE_WEIGHT, opacity: 0.6 }}
        />
        <Polyline
          positions={remainingPath}
          pathOptions={{ color: "#2196F3", weight: LINE_WEIGHT, opacity: 1 }}
        />

        {userPos && (
          <Marker
            position={userPos}
            icon={L.divIcon({
              className: "user-marker",
              html: '<div style="background:blue;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px black;"></div>',
            })}
          >
            <Popup>You</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* BOTTOM MODAL */}
      {summary && remainingStats && (
        <div style={styles.statsCard}>
          <div>
            <div style={styles.etaText}>
              {formatTime(remainingStats.duration)}
            </div>
            <div style={styles.statLabel}>Estimated Arrival</div>
          </div>
          <div style={styles.rightAlign}>
            <div style={styles.statBig}>
              {(remainingStats.distance / 1000).toFixed(1)} km
            </div>
            <div style={styles.statLabel}>Remaining</div>
          </div>
        </div>
      )}
    </div>
  );
}
