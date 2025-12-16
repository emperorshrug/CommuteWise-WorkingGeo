import { create } from "zustand";
import { persist } from "zustand/middleware";
// FIX 1: Added 'type' keyword here
import type { CalculatedRoute, TerminalData } from "@/types/types";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "guest" | "user" | "admin";
}

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasAcceptedTerms: boolean;
  setUser: (user: UserProfile | null) => void;
  setGuestUser: () => void;
  setAcceptedTerms: (accepted: boolean) => void;
  logout: () => void;

  userLocation: [number, number] | null;
  searchDestination: { lat: number; lng: number; name: string } | null;

  selectedTerminal: TerminalData | null;
  selectedRoute: CalculatedRoute | null;

  // FIX 2: Changed 'any[]' to 'unknown[]'
  routeStops: unknown[];

  isRouteViewMode: boolean;
  isPickingLocation: boolean;
  currentMapLocationName: string;

  setUserLocation: (loc: [number, number]) => void;
  setSearchDestination: (
    dest: { lat: number; lng: number; name: string } | null
  ) => void;
  setPickingLocation: (isPicking: boolean) => void;
  setCurrentMapLocationName: (name: string) => void;
  selectTerminal: (terminal: TerminalData) => void;

  // FIX 3: Changed 'any[]' to 'unknown[]'
  selectRoute: (route: CalculatedRoute, stops: unknown[]) => void;

  exitRouteView: () => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasAcceptedTerms: false,
      userLocation: null,
      searchDestination: null,
      selectedTerminal: null,
      selectedRoute: null,
      routeStops: [],
      isRouteViewMode: false,
      isPickingLocation: false,
      currentMapLocationName: "Quezon City",

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
    }),
    {
      name: "commutewise-storage",
      partialize: (state) => ({ hasAcceptedTerms: state.hasAcceptedTerms }),
    }
  )
);
