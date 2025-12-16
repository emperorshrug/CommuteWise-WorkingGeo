import { create } from "zustand";
import { persist } from "zustand/middleware"; // For saving "Terms Accepted" state

// --- TYPES ---
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "guest" | "user" | "admin";
}

interface AppState {
  // --- AUTH STATE (From GoogleAI) ---
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasAcceptedTerms: boolean;
  setUser: (user: UserProfile | null) => void;
  setGuestUser: () => void;
  setAcceptedTerms: (accepted: boolean) => void;
  logout: () => void;

  // --- MAP & ROUTING STATE (From WorkingGeo) ---
  userLocation: [number, number] | null;
  searchDestination: { lat: number; lng: number; name: string } | null;
  selectedTerminal: any | null;
  selectedRoute: any | null;
  routeStops: any[];
  isRouteViewMode: boolean;
  isPickingLocation: boolean;
  currentMapLocationName: string; // "Barangay Tandang Sora"

  // --- ACTIONS ---
  setUserLocation: (loc: [number, number]) => void;
  setSearchDestination: (
    dest: { lat: number; lng: number; name: string } | null
  ) => void;
  setPickingLocation: (isPicking: boolean) => void;
  setCurrentMapLocationName: (name: string) => void;
  selectTerminal: (terminal: any) => void;
  selectRoute: (route: any, stops: any[]) => void;
  exitRouteView: () => void;
  clearSelection: () => void;
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
      isRouteViewMode: false,
      isPickingLocation: false,
      currentMapLocationName: "Locating...",

      // AUTH ACTIONS
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setGuestUser: () =>
        set({
          user: {
            id: "guest",
            email: "",
            display_name: "Guest Commuter",
            role: "guest",
          },
          isAuthenticated: false, // Guest is not "Authenticated" in backend terms
        }),
      setAcceptedTerms: (accepted) => set({ hasAcceptedTerms: accepted }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // MAP ACTIONS
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
      name: "commutewise-storage", // LocalStorage key
      partialize: (state) => ({ hasAcceptedTerms: state.hasAcceptedTerms }), // Only persist this
    }
  )
);
