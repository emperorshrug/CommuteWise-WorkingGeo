// src/types/types.ts

export interface Coordinates {
  lat: number;
  lng: number;
}

export type TransportType =
  | "BUS"
  | "JEEP"
  | "E_JEEP"
  | "TRICYCLE"
  | "MIXED"
  | "WALK"
  | "CAR";

export interface RouteStep {
  instruction: string;
  type: TransportType;
  distance: number;
  duration: number;
  way_points: number[];
}

export interface CalculatedRoute {
  id: string;
  totalTimeMin: number;
  totalDistanceKm: number;
  totalCost: number;
  path: Coordinates[]; // Array of {lat, lng}
  steps: RouteStep[];
  type: "FASTEST" | "CHEAPEST" | "SHORTEST";
  tags: string[];

  // FIX: Added these to satisfy MapCanvas.tsx
  color?: string;
  path_shape?: string; // Optional: In case we use encoded polylines later
}

export interface TerminalData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}
