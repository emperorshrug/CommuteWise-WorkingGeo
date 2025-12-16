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
  path: Coordinates[];
  steps: RouteStep[];
  type: "FASTEST" | "CHEAPEST" | "SHORTEST";
  tags: string[];
}

export interface TerminalData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  // FIX: Changed 'any' to 'unknown' to satisfy linter
  [key: string]: unknown;
}
