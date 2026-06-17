import React, { createContext, useContext, useState, useCallback } from "react";
import { Stop } from "../types";
import { optimizeRoute } from "../utils/api";
import { kochiDefaultStops, KOCHI_CENTER } from "../data/defaultStops";

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

// ─── Context type ─────────────────────────────────────────────────────────────

export interface DashboardContextType {
  stops: Stop[];
  setStops: React.Dispatch<React.SetStateAction<Stop[]>>;
  optimizing: boolean;
  optimized: boolean;
  handleOptimize: () => void;
  handleReorder: (newStops: Stop[]) => void;
  handleRemoveStop: (id: string) => void;
  /** Signals the map search bar to focus — does NOT create a stop */
  requestAddStop: () => void;
  /** The search bar calls this with real geocoded data to create a stop */
  addStopFromSearch: (name: string, address: string, lat: number, lng: number) => void;
  /** True for 100 ms after requestAddStop fires — watched by MapView */
  addStopRequested: boolean;
  // Stat card values (updated after real optimize)
  distance: string;
  duration: string;
  saved: string;
  // Toast
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  // Header
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  pageSubtitle: string;
  setPageSubtitle: React.Dispatch<React.SetStateAction<string>>;
  headerAction: React.ReactNode;
  setHeaderAction: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function calculateEta(
  index: number,
  totalMins: number,
  totalStops: number
): string {
  const baseMinutes = 9 * 60; // 09:00 start
  const cumMins = Math.round((totalMins / totalStops) * index);
  const t = baseMinutes + cumMins;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Default stops ────────────────────────────────────────────────────────────

const defaultStops: Stop[] = kochiDefaultStops;

// ─── Context ──────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stops, setStops]                   = useState<Stop[]>(defaultStops);
  const [optimizing, setOptimizing]         = useState(false);
  const [optimized, setOptimized]           = useState(false);
  const [addStopRequested, setAddStopRequested] = useState(false);

  // Stat card values
  const [distance, setDistance] = useState("--");
  const [duration, setDuration] = useState("--");
  const [saved,    setSaved]    = useState("--");

  // Header
  const [pageTitle,    setPageTitle]    = useState("Overview");
  const [pageSubtitle, setPageSubtitle] = useState("Plan and optimize your route");
  const [headerAction, setHeaderAction] = useState<React.ReactNode>(null);

  // Toast
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    visible: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // Stop handlers
  const handleReorder = (newStops: Stop[]) => {
    const depotIndex = newStops.findIndex(s => s.isDepot);
    if (depotIndex > 0) {
      const depot = newStops[depotIndex];
      const rest  = newStops.filter(s => !s.isDepot);
      setStops([depot, ...rest]);
    } else {
      setStops(newStops);
    }
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
  };

  /** Pulse the map search bar — no stop is created here */
  const requestAddStop = () => {
    setAddStopRequested(true);
    setTimeout(() => setAddStopRequested(false), 100);
  };

  /** Called by the Nominatim search flow with REAL coordinates */
  const addStopFromSearch = (name: string, address: string, lat: number, lng: number) => {
    const nextId = String(Math.max(...stops.map(s => parseInt(s.id) || 0), 0) + 1);
    const newStop: Stop = {
      id:      nextId,
      name,
      address,
      lat,   // real geocoded coordinate — never random
      lng,   // real geocoded coordinate — never random
      eta:   "—",
    };
    setStops(prev => [...prev, newStop]);
  };

  // ─── Optimize (real backend) ────────────────────────────────────────────────

  const handleOptimize = useCallback(async () => {
    if (stops.length < 2) {
      showToast("Add at least 2 stops to optimize", "error");
      return;
    }

    setOptimizing(true);

    try {
      const payload = stops.map(s => ({ lat: s.lat, lng: s.lng }));
      const result  = await optimizeRoute(payload);

      // Reorder the stops array using returned indices
      const reordered = result.ordered_indices.map((i: number) => ({
        ...stops[i],
        eta: calculateEta(i, result.total_duration_minutes, result.ordered_indices.length),
      }));
      setStops(reordered);

      // Update stat cards with real values
      setDistance(`${result.total_distance_km.toFixed(1)} km`);
      setDuration(formatMinutes(result.total_duration_minutes));
      setSaved(`−${result.saved_minutes} min`);

      setOptimized(true);
      showToast("Route optimized successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Optimization failed";
      showToast(msg, "error");
      setOptimized(false);
    } finally {
      setOptimizing(false);
    }
  }, [stops, showToast]);

  return (
    <DashboardContext.Provider
      value={{
        stops, setStops,
        optimizing, optimized,
        handleOptimize,
        handleReorder, handleRemoveStop,
        requestAddStop, addStopFromSearch, addStopRequested,
        distance, duration, saved,
        toast, showToast,
        pageTitle, setPageTitle,
        pageSubtitle, setPageSubtitle,
        headerAction, setHeaderAction,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
};
