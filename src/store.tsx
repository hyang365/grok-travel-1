import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { DIRECTORY, ME, PLACE_BY_ID } from "./data";
import { passesFilters, sortScore, visitCount } from "./logic";
import type { Filters, Person, Place, Season, Scope, SortKey, ThemeName, Trip, ViewName } from "./types";

export const DEFAULT_FILTERS: Filters = {
  overall: 1,
  affordability: 1,
  safety: 1,
  beauty: 1,
  minYalies: 0,
  warmth: 0,
  features: [],
  continents: [],
  query: "",
  scope: "all",
};

const STORAGE_KEY = "triptable-v1";

export type State = {
  theme: ThemeName;
  view: ViewName;
  season: Season;
  sort: SortKey;
  filters: Filters;
  selectedId: string | null;
  emptyGeo: { iso: string; name: string } | null;
  showFriends: boolean;
  friendNetids: string[];
  trips: Trip[];
  friendFocus: string | null;
  toast: string | null;
  homeTick: number;
};

const SEASONS = new Set<Season>(["spring", "summer", "fall", "winter", "weekend"]);
const SORTS = new Set<SortKey>(["yalies", "overall", "affordability", "safety", "beauty"]);
const SCOPES = new Set<Scope>(["all", "countries", "us"]);
const VIEWS = new Set<ViewName>(["map", "catalog", "friends", "itinerary"]);
const FEATURE_IDS = new Set(["beach", "mountain", "city", "island", "desert", "food"]);
const CONTINENT_NAMES = new Set(["North America", "Caribbean", "Central America", "South America", "Europe", "Africa", "Asia", "Oceania"]);

function defaultState(): State {
  return {
    theme: "light",
    view: "map",
    season: "spring",
    sort: "yalies",
    filters: { ...DEFAULT_FILTERS },
    selectedId: null,
    emptyGeo: null,
    showFriends: true,
    friendNetids: ["jalva", "cpark", "erossi"],
    trips: [
      {
        id: "trip-pr",
        placeId: "pr",
        season: "spring",
        start: "2026-03-07",
        end: "2026-03-15",
        note: "Spring break. Ocean Park house, mornings in Old San Juan.",
        friendNetids: ["jalva", "cpark"],
      },
    ],
    friendFocus: "jalva",
    toast: null,
    homeTick: 0,
  };
}

function sanitizeTrip(value: unknown): Trip | null {
  if (!value || typeof value !== "object") return null;
  const trip = value as Partial<Trip>;
  if (!trip.placeId || !trip.start || !trip.end || !trip.season) return null;
  if (!SEASONS.has(trip.season)) return null;
  if (!PLACE_BY_ID.has(trip.placeId)) return null;
  return {
    id: String(trip.id || `trip-${trip.placeId}`),
    placeId: trip.placeId,
    season: trip.season,
    start: trip.start,
    end: trip.end,
    note: typeof trip.note === "string" ? trip.note : "",
    friendNetids: Array.isArray(trip.friendNetids) ? trip.friendNetids.filter((id) => typeof id === "string") : [],
  };
}

function loadState(): State {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const data = JSON.parse(raw) as Partial<State>;
    const incoming = data.filters ?? base.filters;
    const filters = { ...base.filters, ...incoming };
    if (!SCOPES.has(filters.scope)) filters.scope = "all";
    filters.features = Array.isArray(incoming.features) ? incoming.features.filter((id) => FEATURE_IDS.has(id)) : [];
    filters.continents = Array.isArray(incoming.continents) ? incoming.continents.filter((name) => CONTINENT_NAMES.has(name)) : [];
    if (typeof incoming.warmth !== "number") filters.warmth = 0;
    return {
      ...base,
      theme: data.theme === "dark" ? "dark" : "light",
      view: data.view && VIEWS.has(data.view) ? data.view : base.view,
      season: data.season && SEASONS.has(data.season) ? data.season : base.season,
      sort: data.sort && SORTS.has(data.sort) ? data.sort : base.sort,
      filters,
      selectedId: data.selectedId && PLACE_BY_ID.has(data.selectedId) ? data.selectedId : null,
      showFriends: data.showFriends !== false,
      friendNetids: Array.isArray(data.friendNetids)
        ? data.friendNetids.filter((id) => DIRECTORY.some((person) => person.netid === id))
        : base.friendNetids,
      trips: Array.isArray(data.trips) ? data.trips.map(sanitizeTrip).filter((trip): trip is Trip => trip !== null) : base.trips,
      friendFocus: typeof data.friendFocus === "string" ? data.friendFocus : base.friendFocus,
      toast: null,
      emptyGeo: null,
      homeTick: 0,
    };
  } catch {
    return base;
  }
}

export type Action =
  | { type: "setTheme"; theme: ThemeName }
  | { type: "setView"; view: ViewName }
  | { type: "setSeason"; season: Season }
  | { type: "setSort"; sort: SortKey }
  | { type: "patchFilters"; patch: Partial<Filters> }
  | { type: "select"; id: string | null }
  | { type: "selectEmpty"; iso: string; name: string }
  | { type: "world" }
  | { type: "toggleFriends" }
  | { type: "addFriend"; netid: string }
  | { type: "removeFriend"; netid: string }
  | { type: "focusFriend"; netid: string }
  | { type: "saveTrip"; trip: Trip; message?: string }
  | { type: "removeTrip"; id: string }
  | { type: "toast"; message: string }
  | { type: "clearToast" }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setTheme":
      return { ...state, theme: action.theme };
    case "setView":
      return { ...state, view: action.view };
    case "setSeason":
      return { ...state, season: action.season };
    case "setSort":
      return { ...state, sort: action.sort };
    case "patchFilters":
      return { ...state, filters: { ...state.filters, ...action.patch } };
    case "select":
      return {
        ...state,
        selectedId: action.id,
        emptyGeo: null,
        view: state.view === "catalog" ? "catalog" : action.id ? "map" : state.view,
      };
    case "selectEmpty":
      return { ...state, selectedId: null, emptyGeo: { iso: action.iso, name: action.name }, view: "map" };
    case "world":
      return {
        ...state,
        view: "map",
        selectedId: null,
        emptyGeo: null,
        homeTick: state.homeTick + 1,
        filters: { ...state.filters, scope: "all" },
      };
    case "toggleFriends":
      return { ...state, showFriends: !state.showFriends };
    case "addFriend":
      if (state.friendNetids.includes(action.netid)) return state;
      return { ...state, friendNetids: [...state.friendNetids, action.netid], friendFocus: action.netid, toast: "Friend added" };
    case "removeFriend":
      return {
        ...state,
        friendNetids: state.friendNetids.filter((id) => id !== action.netid),
        friendFocus: state.friendFocus === action.netid ? null : state.friendFocus,
        trips: state.trips.map((trip) => ({
          ...trip,
          friendNetids: trip.friendNetids.filter((id) => id !== action.netid),
        })),
        toast: "Friend removed",
      };
    case "focusFriend":
      return { ...state, friendFocus: action.netid, view: "friends" };
    case "saveTrip": {
      const index = state.trips.findIndex((trip) => trip.placeId === action.trip.placeId);
      const trips = index === -1 ? [...state.trips, action.trip] : state.trips.map((trip, i) => (i === index ? action.trip : trip));
      return { ...state, trips, toast: action.message ?? "Saved to itinerary" };
    }
    case "removeTrip":
      return { ...state, trips: state.trips.filter((trip) => trip.id !== action.id), toast: "Removed from itinerary" };
    case "toast":
      return { ...state, toast: action.message };
    case "clearToast":
      return { ...state, toast: null };
    case "reset":
      localStorage.removeItem(STORAGE_KEY);
      return { ...defaultState(), toast: "Demo data restored" };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

type StoreValue = { state: State; dispatch: Dispatch<Action> };

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    const { toast: _toast, emptyGeo: _empty, homeTick: _home, ...persist } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }, [state]);

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(() => dispatch({ type: "clearToast" }), 2400);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTripTable(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("TripTable store missing");
  return value;
}

export type CatalogRow = { place: Place; count: number };

export function useCatalog(): {
  rows: CatalogRow[];
  passed: Set<string>;
  total: number;
  maxCountry: number;
} {
  const { state } = useTripTable();
  return useMemo(() => {
    const rows = [...PLACE_BY_ID.values()]
      .map((place) => ({ place, count: visitCount(place, state.season) }))
      .filter((row) => passesFilters(row.place, row.count, state.filters, state.season));
    rows.sort((a, b) => {
      if (state.sort === "yalies") return b.count - a.count || b.place.scores.overall - a.place.scores.overall;
      return sortScore(b.place.scores, state.sort) - sortScore(a.place.scores, state.sort) || b.count - a.count;
    });
    const passed = new Set(rows.map((row) => row.place.id));
    const total =
      state.filters.scope === "us"
        ? rows.filter((row) => row.place.kind === "spot").reduce((sum, row) => sum + row.count, 0)
        : rows.filter((row) => row.place.kind === "country").reduce((sum, row) => sum + row.count, 0);
    const maxCountry = Math.max(
      1,
      ...[...PLACE_BY_ID.values()].filter((place) => place.kind === "country").map((place) => visitCount(place, state.season)),
    );
    return { rows, passed, total, maxCountry };
  }, [state.filters, state.season, state.sort]);
}

export function useFriends(): Person[] {
  const { state } = useTripTable();
  return state.friendNetids
    .map((netid) => DIRECTORY.find((person) => person.netid === netid))
    .filter((person): person is Person => Boolean(person));
}

export { ME };
