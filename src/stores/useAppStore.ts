// src/stores/useAppStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculatedRoute, TerminalData } from "@/types/types";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "guest" | "user" | "admin";
}

interface AppState {
  // --- AUTH STATE ---
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasAcceptedTerms: boolean;
  setUser: (user: UserProfile | null) => void;
  setGuestUser: () => void;
  setAcceptedTerms: (accepted: boolean) => void;
  logout: () => void;

  // --- MAP STATE (Fixed missing properties) ---
  userLocation: [number, number] | null;
  searchDestination: { lat: number; lng: number; name: string } | null;
  selectedTerminal: TerminalData | null;
  selectedRoute: CalculatedRoute | null;
  routeStops: unknown[];

  // Missing properties restored:
  lastMapCenter: [number, number] | null;
  lastMapZoom: number;
  hasCentered: boolean;

  isRouteViewMode: boolean;
  isPickingLocation: boolean;
  currentMapLocationName: string;

  // --- ACTIONS ---
  setUserLocation: (loc: [number, number]) => void;
  setSearchDestination: (
    dest: { lat: number; lng: number; name: string } | null
  ) => void;
  setPickingLocation: (isPicking: boolean) => void;
  setCurrentMapLocationName: (name: string) => void;
  selectTerminal: (terminal: TerminalData) => void;
  selectRoute: (route: CalculatedRoute, stops: unknown[]) => void;
  exitRouteView: () => void;
  clearSelection: () => void;

  // Map state actions
  setMapState: (center: [number, number], zoom: number) => void;
  setHasCentered: (has: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // INITIAL STATE
      user: null,
      isAuthenticated: false,
      hasAcceptedTerms: false,
      userLocation: null,
      searchDestination: null,
      selectedTerminal: null,
      selectedRoute: null,
      routeStops: [],

      // Map Defaults
      lastMapCenter: [14.676, 121.0437], // Default to Tandang Sora
      lastMapZoom: 15,
      hasCentered: false,

      isRouteViewMode: false,
      isPickingLocation: false,
      currentMapLocationName: "Quezon City",

      // ACTIONS
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setGuestUser: () =>
        set({
          user: {
            id: "guest",
            email: "",
            display_name: "Guest Commuter",
            role: "guest",
          },
          isAuthenticated: false,
        }),
      setAcceptedTerms: (accepted) => set({ hasAcceptedTerms: accepted }),
      logout: () => set({ user: null, isAuthenticated: false }),

      setUserLocation: (loc) => set({ userLocation: loc }),
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
          selectedTerminal: null,
          searchDestination: null,
        }),
      setCurrentMapLocationName: (name) =>
        set({ currentMapLocationName: name }),
      selectTerminal: (terminal) =>
        set({
          selectedTerminal: terminal,
          selectedRoute: null,
          routeStops: [],
          isRouteViewMode: false,
          searchDestination: null,
        }),
      selectRoute: (route, stops) =>
        set({
          selectedRoute: route,
          routeStops: stops,
          isRouteViewMode: true,
        }),
      exitRouteView: () => set({ isRouteViewMode: false }),
      clearSelection: () =>
        set({
          selectedTerminal: null,
          selectedRoute: null,
          routeStops: [],
          isRouteViewMode: false,
          searchDestination: null,
          isPickingLocation: false,
        }),

      // Fix: Implement setMapState
      setMapState: (center, zoom) =>
        set({ lastMapCenter: center, lastMapZoom: zoom }),
      setHasCentered: (has) => set({ hasCentered: has }),
    }),
    {
      name: "commutewise-storage",
      partialize: (state) => ({ hasAcceptedTerms: state.hasAcceptedTerms }),
    }
  )
);
