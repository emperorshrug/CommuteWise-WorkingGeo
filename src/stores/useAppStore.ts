/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

// --- TYPES ---
// We define the shape of our state so TypeScript knows what to expect.
// We use 'any' for Terminal/Route for now, but will replace them with real types (Database Interfaces) later.
interface AppState {
  // 1. DATA (State)
  userLocation: [number, number] | null;
  selectedTerminal: any | null;
  selectedRoute: any | null;

  // 2. ACTIONS (Setters)
  setUserLocation: (loc: [number, number]) => void;
  selectTerminal: (terminal: any) => void;
  selectRoute: (route: any) => void;
  
  // 3. UTILITIES
  clearSelection: () => void;
}

// --- STORE ---
export const useAppStore = create<AppState>((set) => ({
  // Initial Values
  userLocation: null,
  selectedTerminal: null,
  selectedRoute: null,

  // Action Logic
  setUserLocation: (loc) => set({ userLocation: loc }),
  
  selectTerminal: (terminal) => set({ 
    selectedTerminal: terminal,
    selectedRoute: null // Auto-deselect route when picking a new terminal
  }),
  
  selectRoute: (route) => set({ selectedRoute: route }),
  
  clearSelection: () => set({ 
    selectedTerminal: null, 
    selectedRoute: null 
  }),
}));