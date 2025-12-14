/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

// --- TYPES ---
// STATE INTERFACE
// Organized by sections for clarity
interface AppState {
  // 1. DATA
  // with userLocation as [lat, lng]
  // e.g., [14.5995, 120.9842]
  userLocation: [number, number] | null;
  selectedTerminal: any | null;
  selectedRoute: any | null;
  routeStops: any[];

  // 2. SEARCH STATE
  searchDestination: { lat: number; lng: number; name: string } | null;
  isPickingLocation: boolean;

  // 3. VIEW STATE
  isRouteViewMode: boolean;
  currentMapLocationName: string; // NEW: Stores "Holy Spirit", "Pasong Tamo", etc.

  // 4. MAP PERSISTENCE
  lastMapCenter: [number, number] | null;
  lastMapZoom: number;
  hasCentered: boolean;

  // 5. ACTIONS
  setUserLocation: (loc: [number, number]) => void;
  selectTerminal: (terminal: any) => void;
  selectRoute: (route: any, stops: any[]) => void;
  setSearchDestination: (
    dest: { lat: number; lng: number; name: string } | null,
  ) => void;
  setPickingLocation: (isPicking: boolean) => void;
  setCurrentMapLocationName: (name: string) => void; // NEW ACTION

  // 6. UTILITIES
  setMapState: (center: [number, number], zoom: number) => void;
  setHasCentered: (val: boolean) => void;
  exitRouteView: () => void;
  clearSelection: () => void;
}

// --- STORE ---
export const useAppStore = create<AppState>((set) => ({
  userLocation: null,
  selectedTerminal: null,
  selectedRoute: null,
  routeStops: [],
  searchDestination: null,
  isPickingLocation: false,
  isRouteViewMode: false,
  currentMapLocationName: "Locating...", // Default
  lastMapCenter: null,
  lastMapZoom: 13,
  hasCentered: false,

  setUserLocation: (loc) => set({ userLocation: loc }),

  setMapState: (center, zoom) =>
    set({ lastMapCenter: center, lastMapZoom: zoom }),

  setHasCentered: (val) => set({ hasCentered: val }),

  setSearchDestination: (dest) =>
    set({
      searchDestination: dest,
      selectedTerminal: null,
      isRouteViewMode: false,
      isPickingLocation: false,
    }),

  setPickingLocation: (isPicking) =>
    set({
      isPickingLocation: isPicking,
      isRouteViewMode: false,
      selectedTerminal: null,
      searchDestination: null,
    }),

  setCurrentMapLocationName: (name) => set({ currentMapLocationName: name }),

  selectTerminal: (terminal) =>
    set({
      selectedTerminal: terminal,
      selectedRoute: null,
      routeStops: [],
      isRouteViewMode: false,
      searchDestination: null,
      isPickingLocation: false,
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
    }),

  clearSelection: () =>
    set({
      selectedTerminal: null,
      selectedRoute: null,
      routeStops: [],
      isRouteViewMode: false,
      searchDestination: null,
      isPickingLocation: false,
    }),
}));
