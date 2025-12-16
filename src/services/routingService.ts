// FIX: Changed alias '@/' to relative path '../' to ensure it finds the file
import type { Coordinates } from "../types/types";

const GEOCODING_BASE_URL = "https://nominatim.openstreetmap.org";
const ROUTING_BASE_URL = "https://router.project-osrm.org/route/v1";
const QC_VIEWBOX = "120.98,14.58,121.15,14.80";

let lastCall = 0;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const throttle = async () => {
  const now = Date.now();
  if (now - lastCall < 1100) {
    await wait(1100 - (now - lastCall));
  }
  lastCall = Date.now();
};

export const searchPlaces = async (query: string) => {
  if (!query || query.length < 3) return [];
  await throttle();

  try {
    const url = `${GEOCODING_BASE_URL}/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5&countrycodes=ph&addressdetails=1&viewbox=${QC_VIEWBOX}&bounded=0`;

    const response = await fetch(url, {
      headers: { "User-Agent": "CommuteWise-QC-StudentProject/1.0" },
    });

    if (!response.ok) throw new Error("Search API Blocked");

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
};

export const getLocationName = async (
  lat: number,
  lng: number
): Promise<{ name: string; area: string }> => {
  await throttle();

  try {
    const url = `${GEOCODING_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "CommuteWise-QC-StudentProject/1.0" },
    });

    if (!response.ok) throw new Error("Geocoding API Blocked");

    const data = await response.json();
    const a = data.address;

    const name =
      a.amenity ||
      a.building ||
      a.shop ||
      a.tourism ||
      a.leisure ||
      a.road ||
      "Pinned Location";

    const area =
      a.suburb || a.quarter || a.neighbourhood || a.city || "Quezon City";

    return { name, area };
  } catch {
    return {
      name: "Unknown Location",
      area: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
};

export const getWalkingPath = async (
  start: Coordinates,
  end: Coordinates
): Promise<[number, number][] | null> => {
  try {
    const url = `${ROUTING_BASE_URL}/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coordinates = data.routes[0].geometry.coordinates.map((c: any) => [
      c[1],
      c[0],
    ]);

    return coordinates;
  } catch {
    return null;
  }
};
