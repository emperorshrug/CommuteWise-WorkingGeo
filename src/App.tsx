import React, { useState, useEffect, useMemo } from "react";
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

// --- Fix for default Leaflet markers in React ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- MATH HELPER FUNCTIONS ---

// 1. Calculate distance between two points (lat/lng) in meters
const getDistance = (pt1: [number, number], pt2: [number, number]) => {
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
const getProjectedPointOnLine = (
  p: [number, number],
  a: [number, number],
  b: [number, number]
): [number, number] => {
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
  // t < 0: before start; t > 1: after end; 0 <= t <= 1: on line
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
const RecenterMap = ({ position }: { position: [number, number] | null }) => {
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
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [debugInfo, setDebugInfo] = useState("Waiting for GPS...");

  // 1. INITIAL SETUP: Get location once and generate a FAKE ROUTE starting there
  // This allows you to test it anywhere in the world immediately.
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const start = [latitude, longitude] as [number, number];
      setUserPos(start);

      // GENERATE A TEST ROUTE:
      // Starts at your location, goes North-East for ~100 meters
      // In a real app, you would fetch this from an API.
      const testRoute: [number, number][] = [
        start,
        [latitude + 0.0003, longitude + 0.0003], // ~40m away
        [latitude + 0.0006, longitude + 0.0006], // ~80m away
        [latitude + 0.001, longitude + 0.001], // ~120m away (Destination)
      ];
      setRoute(testRoute);
    });
  }, []);

  // 2. WATCH POSITION: Track user movement
  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        setDebugInfo(
          `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
        );
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, distanceFilter: 1 } // Update every 1 meter
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
    let bestProjectedPoint: [number, number] = userPos;

    // Loop through every segment of the route (Point A to Point B)
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];

      // Find the closest spot on this specific line segment
      const projected = getProjectedPointOnLine(userPos, start, end);
      const dist = getDistance(userPos, projected);

      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
        bestProjectedPoint = projected;
      }
    }

    // Logic:
    // Traveled = All points UP TO the best segment + the projected point
    // Remaining = The projected point + All points AFTER the best segment

    const pathBefore = route.slice(0, bestIndex + 1);
    const pathAfter = route.slice(bestIndex + 1);

    return {
      traveledPath: [...pathBefore, bestProjectedPoint],
      remainingPath: [bestProjectedPoint, ...pathAfter],
    };
  }, [userPos, route]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Debug Header */}
      <div
        style={{
          padding: "10px",
          background: "#333",
          color: "#fff",
          fontSize: "12px",
        }}
      >
        {debugInfo}
      </div>

      {userPos ? (
        <MapContainer center={userPos} zoom={18} style={{ flex: 1 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Auto-center map on user move */}
          <RecenterMap position={userPos} />

          {/* 1. TRAVELED PATH (Gray/Light) */}
          <Polyline
            positions={traveledPath}
            pathOptions={{ color: "gray", weight: 8, opacity: 0.5 }}
          />

          {/* 2. REMAINING PATH (Blue/Active) */}
          <Polyline
            positions={remainingPath}
            pathOptions={{ color: "blue", weight: 8, opacity: 1.0 }}
          />

          {/* 3. User Marker */}
          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>

          {/* 4. Destination Marker (Last point of route) */}
          {route.length > 0 && (
            <Marker position={route[route.length - 1]}>
              <Popup>Destination</Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading Map & GPS...
        </div>
      )}
    </div>
  );
}
