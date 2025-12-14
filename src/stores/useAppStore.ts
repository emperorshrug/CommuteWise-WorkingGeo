/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

// --- TYPES ---
interface AppState {
  // 1. DATA (State)
  userLocation: [number, number] | null;
  selectedTerminal: any | null; // Replace 'any' with Terminal type later
  selectedRoute: any | null; // Replace 'any' with Route type later
  routeStops: any[]; // New property for stops

  // 2. VIEW STATE
  isRouteViewMode: boolean; // New property for view mode

  // 3. ACTIONS (Setters)
  setUserLocation: (loc: [number, number]) => void;
  selectTerminal: (terminal: any) => void;
  selectRoute: (route: any, stops: any[]) => void; // Updated signature

  // 4. UTILITIES
  exitRouteView: () => void; // New action
  clearSelection: () => void;
}

// --- STORE ---
export const useAppStore = create<AppState>((set) => ({
  // Initial Values
  userLocation: null,
  selectedTerminal: null,
  selectedRoute: null,
  routeStops: [],
  isRouteViewMode: false,

  // Action Logic
  setUserLocation: (loc) => set({ userLocation: loc }),

  selectTerminal: (terminal) =>
    set({
      selectedTerminal: terminal,
      selectedRoute: null,
      routeStops: [],
      isRouteViewMode: false,
    }),

  selectRoute: (route, stops) =>
    set({
      selectedRoute: route,
      routeStops: stops,
      isRouteViewMode: true,
    }),

  exitRouteView: () =>
    set({
      isRouteViewMode: false,
      // We keep selectedRoute/routeStops so the map can still show faint lines if needed,
      // or you can clear them here if you prefer a clean slate.
    }),

  clearSelection: () =>
    set({
      selectedTerminal: null,
      selectedRoute: null,
      routeStops: [],
      isRouteViewMode: false,
    }),
}));
