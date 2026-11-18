// Flight-finder preferences, saved flights and fare alerts.
// Kept apart from the main TripTable store so the existing reducer stays untouched.
import { useSyncExternalStore } from "react";
import type { SortMode } from "./engine";

export type SavedFlight = {
  id: string;
  placeId: string;
  title: string;
  gateway: string;
  flightNo: string | null;
  out: string;
  back: string;
  totalEach: number;
  leaveBy: string;
};

export type FareAlert = { id: string; placeId: string; out: string; back: string; price: number };

export type FlightState = {
  boycottAvelo: boolean;
  destId: string | null;
  out: string | null;
  back: string | null;
  gateways: string[];
  sort: SortMode;
  moneyWeight: number;
  nonstopOnly: boolean;
  includeGround: boolean;
  window: "any" | "morning" | "afternoon" | "evening";
  crew: string[]; // friend netids flying with you
  saved: SavedFlight[];
  alerts: FareAlert[];
};

const KEY = "triptable-flights-v1";
const ALL_GATEWAYS = ["HVN", "BDL", "JFK", "LGA", "EWR", "BOS"];

const defaults: FlightState = {
  boycottAvelo: false,
  destId: null,
  out: null,
  back: null,
  gateways: ALL_GATEWAYS,
  sort: "best",
  moneyWeight: 0.6,
  nonstopOnly: false,
  includeGround: true,
  window: "any",
  crew: [],
  saved: [],
  alerts: [],
};

function load(): FlightState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const data = JSON.parse(raw) as Partial<FlightState>;
    const merged = { ...defaults, ...data };
    merged.gateways = Array.isArray(data.gateways) && data.gateways.length ? data.gateways.filter((g) => ALL_GATEWAYS.includes(g)) : ALL_GATEWAYS;
    if (!merged.gateways.length) merged.gateways = ALL_GATEWAYS;
    merged.saved = Array.isArray(data.saved) ? data.saved : [];
    merged.alerts = Array.isArray(data.alerts) ? data.alerts : [];
    merged.crew = Array.isArray(data.crew) ? data.crew : [];
    return merged;
  } catch {
    return { ...defaults };
  }
}

let state: FlightState = load();
const listeners = new Set<() => void>();

export const flightStore = {
  get: () => state,
  set(patch: Partial<FlightState> | ((s: FlightState) => Partial<FlightState>)) {
    const next = typeof patch === "function" ? patch(state) : patch;
    state = { ...state, ...next };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  reset() {
    state = { ...defaults };
    localStorage.removeItem(KEY);
    listeners.forEach((fn) => fn());
  },
};

export function useFlights(): FlightState {
  return useSyncExternalStore(flightStore.subscribe, flightStore.get, flightStore.get);
}

export { ALL_GATEWAYS };
