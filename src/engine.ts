// Flight + ground search engine for TripTable.
// Prices are a deterministic demo model (booking curve, seasonality, airline type).
// Swap `routeCarriers` / `fareFor` for a real API (Duffel, Amadeus, Kiwi) later.

import { parseISODate } from "../logic";
import type { Place } from "../types";

export type GroundLeg = {
  id: string;
  label: string;
  mins: number;
  cost: number;
  co2: number;
  splittable: boolean; // a car you can share with friends
};

export type Gateway = {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  security: number;
  ground: GroundLeg[];
};

export const YALE = { lat: 41.3083, lng: -72.9279 };

export const GATEWAYS: Gateway[] = [
  {
    code: "HVN", name: "Tweed-New Haven", city: "New Haven", lat: 41.2637, lng: -72.8868, security: 45,
    ground: [
      { id: "hvn-uber", label: "Uber to Tweed", mins: 15, cost: 18, co2: 2, splittable: true },
      { id: "hvn-bus", label: "CTtransit bus", mins: 40, cost: 2, co2: 1, splittable: false },
    ],
  },
  {
    code: "BDL", name: "Bradley", city: "Hartford", lat: 41.9389, lng: -72.6832, security: 75,
    ground: [
      { id: "bdl-uber", label: "Uber to Bradley", mins: 60, cost: 95, co2: 14, splittable: true },
      { id: "bdl-train", label: "Hartford Line + Bradley Flyer", mins: 105, cost: 12, co2: 3, splittable: false },
      { id: "bdl-shuttle", label: "CT Limo shuttle", mins: 75, cost: 59, co2: 6, splittable: false },
    ],
  },
  {
    code: "JFK", name: "JFK", city: "New York", lat: 40.6413, lng: -73.7781, security: 120,
    ground: [
      { id: "jfk-train", label: "Metro-North + LIRR + AirTrain", mins: 150, cost: 38, co2: 4, splittable: false },
      { id: "jfk-shuttle", label: "GO Airport Shuttle", mins: 125, cost: 89, co2: 10, splittable: false },
      { id: "jfk-uber", label: "Uber to JFK", mins: 110, cost: 210, co2: 25, splittable: true },
    ],
  },
  {
    code: "LGA", name: "LaGuardia", city: "New York", lat: 40.7769, lng: -73.874, security: 100,
    ground: [
      { id: "lga-train", label: "Metro-North + Q70 bus", mins: 130, cost: 26, co2: 3, splittable: false },
      { id: "lga-uber", label: "Uber to LaGuardia", mins: 95, cost: 180, co2: 22, splittable: true },
    ],
  },
  {
    code: "EWR", name: "Newark", city: "Newark", lat: 40.6895, lng: -74.1745, security: 120,
    ground: [
      { id: "ewr-amtrak", label: "Amtrak to Newark Airport", mins: 120, cost: 52, co2: 4, splittable: false },
      { id: "ewr-uber", label: "Uber to Newark", mins: 120, cost: 230, co2: 28, splittable: true },
    ],
  },
  {
    code: "BOS", name: "Logan", city: "Boston", lat: 42.3656, lng: -71.0096, security: 110,
    ground: [{ id: "bos-amtrak", label: "Amtrak + Silver Line", mins: 190, cost: 61, co2: 5, splittable: false }],
  },
];

export const AIRLINES: Record<string, { name: string; color: string; ulcc?: boolean; legacy?: boolean }> = {
  XP: { name: "Avelo", color: "#7b3fe4", ulcc: true },
  B6: { name: "JetBlue", color: "#1b4d9c" },
  DL: { name: "Delta", color: "#c8102e", legacy: true },
  UA: { name: "United", color: "#005daa", legacy: true },
  AA: { name: "American", color: "#0078d2", legacy: true },
  WN: { name: "Southwest", color: "#f9b612" },
  NK: { name: "Spirit", color: "#c9a600", ulcc: true },
  MX: { name: "Breeze", color: "#00a3e0", ulcc: true },
  F9: { name: "Frontier", color: "#00843d", ulcc: true },
  BA: { name: "British Airways", color: "#2e5c99", legacy: true },
  LH: { name: "Lufthansa", color: "#05164d", legacy: true },
  AF: { name: "Air France", color: "#002157", legacy: true },
  KL: { name: "KLM", color: "#00a1de", legacy: true },
  IB: { name: "Iberia", color: "#d7192d" },
  TP: { name: "TAP Portugal", color: "#00a650" },
  AZ: { name: "ITA Airways", color: "#1b3c87" },
  EI: { name: "Aer Lingus", color: "#006272" },
  FI: { name: "Icelandair", color: "#003a7d" },
  TK: { name: "Turkish", color: "#c70a0c" },
  EK: { name: "Emirates", color: "#d71921", legacy: true },
  QR: { name: "Qatar", color: "#5c0632", legacy: true },
  NH: { name: "ANA", color: "#13448f", legacy: true },
  JL: { name: "JAL", color: "#cc0000", legacy: true },
  KE: { name: "Korean Air", color: "#00256c", legacy: true },
  CX: { name: "Cathay Pacific", color: "#006564", legacy: true },
  AC: { name: "Air Canada", color: "#d22630" },
  AM: { name: "Aeroméxico", color: "#0b2343" },
  CM: { name: "Copa", color: "#0a2d6e" },
  AV: { name: "Avianca", color: "#da291c" },
  LA: { name: "LATAM", color: "#e8114b" },
  AT: { name: "Royal Air Maroc", color: "#c1272d" },
  MS: { name: "EgyptAir", color: "#00265d" },
  QF: { name: "Qantas", color: "#e40000", legacy: true },
  SQ: { name: "Singapore", color: "#f99f1c", legacy: true },
};

const GATEWAY_CARRIERS: Record<string, { dom: string[]; intl: string[] }> = {
  HVN: { dom: ["XP"], intl: [] },
  BDL: { dom: ["WN", "DL", "AA", "UA", "B6", "MX", "NK", "F9"], intl: ["AC", "AA", "DL", "UA"] },
  JFK: { dom: ["B6", "DL", "AA"], intl: ["BA", "AF", "KL", "LH", "IB", "TP", "AZ", "EI", "FI", "TK", "EK", "QR", "NH", "JL", "KE", "CX", "AM", "CM", "AV", "LA", "AT", "MS", "QF", "SQ", "DL", "B6", "AA"] },
  LGA: { dom: ["DL", "AA", "UA", "WN", "B6", "NK", "F9"], intl: ["AC", "DL", "AA"] },
  EWR: { dom: ["UA", "B6", "AA", "DL", "NK"], intl: ["UA", "LH", "TP", "TK", "EK", "SQ", "AF", "AM", "CM", "AV", "AT", "EI", "FI"] },
  BOS: { dom: ["B6", "DL", "AA", "UA", "WN"], intl: ["BA", "LH", "AF", "KL", "IB", "TP", "AZ", "EI", "FI", "TK", "EK", "QR", "JL", "KE", "CX", "CM", "AT", "B6", "DL"] },
};

// Avelo nonstops from Tweed (demo schedule).
const AVELO_FROM_HVN = new Set(["SJU", "CHS", "BNA", "MCO", "TPA", "FLL", "PBI", "RSW", "SAV", "MYR", "RDU", "LAS", "ATL", "BWI", "PIT"]);

type Airport = { code: string; city: string; lat: number; lng: number; iso: string };

const AIRPORTS: Airport[] = [
  { code: "SJU", city: "San Juan", lat: 18.439, lng: -66.002, iso: "PR" },
  { code: "MEX", city: "Mexico City", lat: 19.436, lng: -99.072, iso: "MX" },
  { code: "OAX", city: "Oaxaca", lat: 16.999, lng: -96.727, iso: "MX" },
  { code: "CUN", city: "Cancún", lat: 21.037, lng: -86.877, iso: "MX" },
  { code: "BOS", city: "Boston", lat: 42.366, lng: -71.01, iso: "US" },
  { code: "DCA", city: "Washington", lat: 38.852, lng: -77.038, iso: "US" },
  { code: "PHL", city: "Philadelphia", lat: 39.874, lng: -75.243, iso: "US" },
  { code: "MIA", city: "Miami", lat: 25.795, lng: -80.29, iso: "US" },
  { code: "MSY", city: "New Orleans", lat: 29.993, lng: -90.258, iso: "US" },
  { code: "AUS", city: "Austin", lat: 30.197, lng: -97.666, iso: "US" },
  { code: "CHS", city: "Charleston", lat: 32.899, lng: -80.04, iso: "US" },
  { code: "BNA", city: "Nashville", lat: 36.124, lng: -86.678, iso: "US" },
  { code: "LAX", city: "Los Angeles", lat: 33.942, lng: -118.408, iso: "US" },
  { code: "SFO", city: "San Francisco", lat: 37.621, lng: -122.379, iso: "US" },
  { code: "HNL", city: "Honolulu", lat: 21.318, lng: -157.922, iso: "US" },
  { code: "PHX", city: "Phoenix", lat: 33.434, lng: -112.012, iso: "US" },
  { code: "ELP", city: "El Paso", lat: 31.807, lng: -106.378, iso: "US" },
  { code: "LAS", city: "Las Vegas", lat: 36.084, lng: -115.154, iso: "US" },
  { code: "PSP", city: "Palm Springs", lat: 33.83, lng: -116.507, iso: "US" },
  { code: "SJC", city: "San Jose", lat: 37.363, lng: -121.929, iso: "US" },
  { code: "BGR", city: "Bangor", lat: 44.807, lng: -68.828, iso: "US" },
  { code: "AVL", city: "Asheville", lat: 35.436, lng: -82.542, iso: "US" },
  { code: "ORD", city: "Chicago", lat: 41.974, lng: -87.907, iso: "US" },
  { code: "DEN", city: "Denver", lat: 39.856, lng: -104.674, iso: "US" },
  { code: "FCO", city: "Rome", lat: 41.8, lng: 12.239, iso: "IT" },
  { code: "FLR", city: "Florence", lat: 43.81, lng: 11.205, iso: "IT" },
  { code: "NAP", city: "Naples", lat: 40.886, lng: 14.291, iso: "IT" },
  { code: "HND", city: "Tokyo", lat: 35.549, lng: 139.78, iso: "JP" },
  { code: "KIX", city: "Osaka (Kyoto)", lat: 34.434, lng: 135.244, iso: "JP" },
  { code: "MAD", city: "Madrid", lat: 40.498, lng: -3.567, iso: "ES" },
  { code: "BCN", city: "Barcelona", lat: 41.297, lng: 2.078, iso: "ES" },
  { code: "CDG", city: "Paris", lat: 49.01, lng: 2.548, iso: "FR" },
  { code: "LHR", city: "London", lat: 51.47, lng: -0.454, iso: "GB" },
  { code: "EDI", city: "Edinburgh", lat: 55.95, lng: -3.372, iso: "GB" },
  { code: "KEF", city: "Reykjavík", lat: 63.985, lng: -22.605, iso: "IS" },
  { code: "LIS", city: "Lisbon", lat: 38.774, lng: -9.134, iso: "PT" },
  { code: "ICN", city: "Seoul", lat: 37.46, lng: 126.44, iso: "KR" },
  { code: "RAK", city: "Marrakech", lat: 31.607, lng: -8.036, iso: "MA" },
  { code: "TNG", city: "Tangier", lat: 35.727, lng: -5.917, iso: "MA" },
  { code: "CMN", city: "Casablanca", lat: 33.367, lng: -7.59, iso: "MA" },
  { code: "SJO", city: "San José", lat: 9.994, lng: -84.209, iso: "CR" },
  { code: "LIR", city: "Liberia", lat: 10.593, lng: -85.544, iso: "CR" },
  { code: "ATH", city: "Athens", lat: 37.936, lng: 23.947, iso: "GR" },
  { code: "ZRH", city: "Zürich", lat: 47.458, lng: 8.556, iso: "CH" },
  { code: "GVA", city: "Geneva", lat: 46.238, lng: 6.109, iso: "CH" },
  { code: "BKK", city: "Bangkok", lat: 13.69, lng: 100.75, iso: "TH" },
  { code: "YUL", city: "Montréal", lat: 45.47, lng: -73.741, iso: "CA" },
  { code: "YYZ", city: "Toronto", lat: 43.677, lng: -79.631, iso: "CA" },
  { code: "PUJ", city: "Punta Cana", lat: 18.567, lng: -68.363, iso: "DO" },
  { code: "NAS", city: "Nassau", lat: 25.039, lng: -77.466, iso: "BS" },
  { code: "MBJ", city: "Montego Bay", lat: 18.504, lng: -77.913, iso: "JM" },
  { code: "AMS", city: "Amsterdam", lat: 52.31, lng: 4.768, iso: "NL" },
  { code: "BER", city: "Berlin", lat: 52.366, lng: 13.503, iso: "DE" },
  { code: "DUB", city: "Dublin", lat: 53.421, lng: -6.27, iso: "IE" },
  { code: "DBV", city: "Dubrovnik", lat: 42.561, lng: 18.268, iso: "HR" },
  { code: "PRG", city: "Prague", lat: 50.101, lng: 14.26, iso: "CZ" },
  { code: "IST", city: "Istanbul", lat: 41.262, lng: 28.742, iso: "TR" },
  { code: "SGN", city: "Ho Chi Minh City", lat: 10.819, lng: 106.652, iso: "VN" },
  { code: "DPS", city: "Bali", lat: -8.748, lng: 115.167, iso: "ID" },
  { code: "BOG", city: "Bogotá", lat: 4.702, lng: -74.147, iso: "CO" },
  { code: "CTG", city: "Cartagena", lat: 10.442, lng: -75.513, iso: "CO" },
  { code: "LIM", city: "Lima", lat: -12.022, lng: -77.114, iso: "PE" },
  { code: "CAI", city: "Cairo", lat: 30.122, lng: 31.406, iso: "EG" },
  { code: "SYD", city: "Sydney", lat: -33.94, lng: 151.175, iso: "AU" },
];

// A country pin flies to its main gateway, not its geographic center.
const COUNTRY_AIRPORT: Record<string, string> = {
  PR: "SJU", MX: "CUN", US: "LAX", IT: "FCO", JP: "HND", ES: "MAD", FR: "CDG", GB: "LHR", IS: "KEF", PT: "LIS",
  KR: "ICN", MA: "RAK", CR: "SJO", GR: "ATH", CH: "ZRH", TH: "BKK", CA: "YYZ", DO: "PUJ", BS: "NAS", JM: "MBJ",
  NL: "AMS", DE: "BER", IE: "DUB", HR: "DBV", CZ: "PRG", TR: "IST", VN: "SGN", ID: "DPS", CO: "CTG", PE: "LIM",
  EG: "CAI", AU: "SYD",
};

// Places close enough that you skip the airport.
type GroundRoute = { label: string; kind: "train" | "bus" | "drive" | "ferry"; mins: number; cost: number; co2: number; splittable?: boolean };
const GROUND_ROUTES: Record<string, GroundRoute[]> = {
  nyc: [
    { label: "Metro-North to Grand Central", kind: "train", mins: 125, cost: 21, co2: 3 },
    { label: "Amtrak to Penn Station", kind: "train", mins: 100, cost: 42, co2: 3 },
    { label: "FlixBus from Union Station", kind: "bus", mins: 135, cost: 15, co2: 3 },
  ],
  boston: [
    { label: "Amtrak Northeast Regional", kind: "train", mins: 165, cost: 49, co2: 5 },
    { label: "Acela", kind: "train", mins: 135, cost: 95, co2: 5 },
    { label: "Peter Pan bus", kind: "bus", mins: 180, cost: 25, co2: 4 },
  ],
  philly: [
    { label: "Amtrak Northeast Regional", kind: "train", mins: 175, cost: 58, co2: 6 },
    { label: "Metro-North + NJ Transit + SEPTA", kind: "train", mins: 260, cost: 38, co2: 6 },
  ],
  dc: [
    { label: "Amtrak Northeast Regional", kind: "train", mins: 300, cost: 79, co2: 9 },
    { label: "Acela", kind: "train", mins: 250, cost: 145, co2: 9 },
    { label: "FlixBus", kind: "bus", mins: 390, cost: 35, co2: 8 },
  ],
  montreal: [{ label: "Amtrak Adirondack via NYC", kind: "train", mins: 760, cost: 112, co2: 18 }],
  hudson: [
    { label: "Metro-North + Hudson Line", kind: "train", mins: 170, cost: 34, co2: 4 },
    { label: "Zipcar drive", kind: "drive", mins: 95, cost: 110, co2: 22, splittable: true },
  ],
  montauk: [
    { label: "Cross Sound Ferry + drive", kind: "ferry", mins: 210, cost: 95, co2: 20, splittable: true },
    { label: "Metro-North + LIRR to Montauk", kind: "train", mins: 330, cost: 58, co2: 6 },
  ],
  block: [{ label: "Drive to Point Judith + Block Island Ferry", kind: "ferry", mins: 140, cost: 68, co2: 15 }],
  newport: [
    { label: "Zipcar drive", kind: "drive", mins: 105, cost: 95, co2: 20, splittable: true },
    { label: "Amtrak to Kingston + RIPTA bus", kind: "train", mins: 170, cost: 41, co2: 5 },
  ],
  acadia: [{ label: "Drive (rental, split)", kind: "drive", mins: 420, cost: 260, co2: 95, splittable: true }],
};

export type Destination = {
  place: Place;
  airport: Airport | null;
  transfer: { label: string; mins: number; cost: number } | null;
  domestic: boolean;
  groundRoutes: GroundRoute[];
};

export type Option = {
  id: string;
  kind: "flight" | "train" | "bus" | "drive" | "ferry";
  title: string;
  gateway: string;
  carrier: string | null;
  flightNo: string | null;
  stops: number;
  via: string | null;
  depMins: number;
  travelMins: number; // gate to gate, or ground route
  outFare: number;
  backFare: number;
  ground: GroundLeg | null;
  groundEach: number; // per person, both ways
  transferEach: number;
  totalEach: number; // round trip, door to door, per person
  doorMins: number; // one way, door to door
  leaveBy: number;
  co2: number;
  transfers: number;
  score: number;
  badges: string[];
  bookUrl: string;
};

export type Prefs = {
  gateways: string[];
  boycottAvelo: boolean;
  nonstopOnly: boolean;
  includeGround: boolean;
  window: "any" | "morning" | "afternoon" | "evening";
  groupSize: number;
};

// ---------- helpers ----------
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seeded(seed: string): () => number {
  let s = hash(seed) || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
export function todayISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
}
export function addDays(iso: string, days: number): string {
  return new Date(parseISODate(iso) + days * 86_400_000).toISOString().slice(0, 10);
}
export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b) - parseISODate(a)) / 86_400_000);
}
export function clock(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
export function duration(mins: number): string {
  const m = Math.round(mins);
  const h = Math.floor(m / 60);
  return h ? `${h}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`;
}

// ---------- Yale breaks (Yale College 2026–27; verify on the official calendar) ----------
export const BREAKS = [
  { id: "nov", label: "Thanksgiving", start: "2026-11-21", end: "2026-11-29", peaks: ["2026-11-21", "2026-11-25", "2026-11-29"] },
  { id: "win", label: "Winter recess", start: "2026-12-22", end: "2027-01-18", peaks: ["2026-12-19", "2026-12-22", "2027-01-17"] },
  { id: "spr", label: "Spring break", start: "2027-03-13", end: "2027-03-28", peaks: ["2027-03-13", "2027-03-28"] },
  { id: "sum", label: "Summer", start: "2027-05-12", end: "2027-08-24", peaks: ["2027-05-12"] },
];

// ---------- destination resolution ----------
export function resolveDestination(place: Place): Destination {
  const domestic = place.iso === "US" || place.iso === "PR";
  const groundRoutes = GROUND_ROUTES[place.id] ?? [];
  let airport: Airport | null = null;
  if (place.kind === "country") {
    airport = AIRPORTS.find((a) => a.code === COUNTRY_AIRPORT[place.iso]) ?? null;
  } else {
    const sameCountry = AIRPORTS.filter((a) => a.iso === place.iso);
    const pool = sameCountry.length ? sameCountry : AIRPORTS;
    airport = pool.reduce<Airport | null>((best, a) => (!best || km(a, place) < km(best, place) ? a : best), null);
  }
  if (airport && km(YALE, airport) < 320) airport = null; // too close to fly
  let transfer: Destination["transfer"] = null;
  if (airport && place.kind === "spot") {
    const d = km(airport, place);
    if (d > 45) {
      const mins = Math.round((d * 1.25) / 75 * 60 + 15);
      transfer = { label: `${airport.city} → ${place.name} by car or bus`, mins, cost: Math.round(18 + d * 0.22) };
    }
  }
  return { place, airport, transfer, domestic, groundRoutes };
}

// ---------- pricing model ----------
function demand(date: string): number {
  let m = 1;
  const dow = new Date(parseISODate(date)).getUTCDay();
  if (dow === 5 || dow === 0) m *= 1.14;
  if (dow === 2 || dow === 3) m *= 0.91;
  for (const b of BREAKS) {
    for (const p of b.peaks) {
      const gap = Math.abs(daysBetween(p, date));
      if (gap === 0) m *= 1.36;
      else if (gap === 1) m *= 1.17;
      else if (gap === 2) m *= 1.06;
    }
  }
  const month = new Date(parseISODate(date)).getUTCMonth();
  if (month === 6 || month === 11) m *= 1.1;
  return m;
}
function bookingCurve(daysOut: number, intl: boolean): number {
  const [lo, hi] = intl ? [60, 150] : [21, 70];
  if (daysOut < 3) return 1.75;
  if (daysOut < 7) return 1.45;
  if (daysOut < 14) return 1.22;
  if (daysOut < lo) return 1.08;
  if (daysOut <= hi) return 0.94;
  return 1.04;
}
function routeCarriers(gateway: string, dest: Destination): { code: string; stops: number; via: string | null }[] {
  if (!dest.airport) return [];
  const pool = GATEWAY_CARRIERS[gateway];
  if (!pool) return [];
  let list = dest.domestic ? pool.dom : pool.intl;
  if (gateway === "HVN") list = AVELO_FROM_HVN.has(dest.airport.code) ? ["XP"] : [];
  const r = seeded(`${gateway}-${dest.airport.code}`);
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j] as string, shuffled[i] as string];
  }
  const dist = km(GATEWAYS.find((g) => g.code === gateway) ?? YALE, dest.airport);
  const hubs: Record<string, string> = { DL: "ATL", UA: "ORD", AA: "CLT", B6: "FLL", WN: "BWI", NK: "FLL", F9: "DEN", MX: "CHS", AC: "YYZ", BA: "LHR", LH: "FRA", AF: "CDG", KL: "AMS", IB: "MAD", TP: "LIS", AZ: "FCO", EI: "DUB", FI: "KEF", TK: "IST", EK: "DXB", QR: "DOH", NH: "HND", JL: "HND", KE: "ICN", CX: "HKG", AM: "MEX", CM: "PTY", AV: "BOG", LA: "LIM", AT: "CMN", MS: "CAI", QF: "LAX", SQ: "FRA" };
  return shuffled.slice(0, gateway === "HVN" ? 1 : 4).map((code) => {
    const chance = gateway === "HVN" ? 1 : dist > 10000 ? 0.35 : dist > 6000 ? 0.65 : dist > 3000 ? 0.6 : 0.85;
    const stops = r() < chance ? 0 : 1;
    let via = stops ? (hubs[code] ?? "ATL") : null;
    if (via && via === dest.airport?.code) via = "ATL";
    return { code, stops, via };
  });
}
function fareFor(gateway: string, dest: Destination, carrier: string, stops: number, date: string, bookedOn: string): number {
  if (!dest.airport) return 0;
  const gw = GATEWAYS.find((g) => g.code === gateway);
  const dist = km(gw ?? YALE, dest.airport);
  const info = AIRLINES[carrier];
  let p = dest.domestic ? 55 + dist * 0.085 : 170 + dist * 0.075;
  if (info?.ulcc) p *= 0.68;
  if (info?.legacy) p *= 1.08;
  if (stops) p *= 0.84;
  const r = seeded(`${gateway}-${dest.airport.code}-${carrier}-${date}`);
  p *= demand(date) * bookingCurve(daysBetween(bookedOn, date), !dest.domestic) * (0.86 + r() * 0.32);
  return Math.round(p);
}
function depTime(gateway: string, code: string, carrier: string, date: string): number {
  const r = seeded(`dep-${gateway}-${code}-${carrier}-${date}`);
  return 6 * 60 + Math.floor(r() * 16) * 60 + (r() < 0.5 ? 0 : 30);
}
function inWindow(mins: number, w: Prefs["window"]): boolean {
  if (w === "morning") return mins < 12 * 60;
  if (w === "afternoon") return mins >= 12 * 60 && mins < 17 * 60;
  if (w === "evening") return mins >= 17 * 60;
  return true;
}
function googleFlights(from: string, to: string, out: string, back: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${from} to ${to} on ${out} through ${back}`)}`;
}

// ---------- search ----------
export function search(dest: Destination, out: string, back: string, prefs: Prefs, bookedOn = todayISO()): Option[] {
  const options: Option[] = [];
  const group = Math.max(1, prefs.groupSize);
  if (dest.airport) {
    for (const gw of GATEWAYS) {
      if (!prefs.gateways.includes(gw.code)) continue;
      for (const c of routeCarriers(gw.code, dest)) {
        if (prefs.boycottAvelo && c.code === "XP") continue;
        if (prefs.nonstopOnly && c.stops) continue;
        const dep = depTime(gw.code, dest.airport.code, c.code, out);
        if (!inWindow(dep, prefs.window)) continue;
        const dist = km(gw, dest.airport);
        const air = (dist / 820) * 60 + 35 + (c.stops ? 95 : 0);
        const outFare = fareFor(gw.code, dest, c.code, c.stops, out, bookedOn);
        const backFare = fareFor(gw.code, dest, c.code, c.stops, back, bookedOn);
        const flightNo = `${c.code} ${100 + (hash(gw.code + dest.airport.code + c.code) % 2800)}`;
        for (const g of gw.ground) {
          const groundEach = Math.round((g.splittable ? g.cost / group : g.cost) * 2);
          const transferEach = dest.transfer ? Math.round((dest.transfer.cost * 2) / Math.min(group, 4)) : 0;
          const doorMins = g.mins + gw.security + air + 25 + (dest.transfer?.mins ?? 0);
          options.push({
            id: `${gw.code}-${c.code}-${g.id}`,
            kind: "flight",
            title: `${AIRLINES[c.code]?.name ?? c.code} ${c.stops ? `1 stop via ${c.via}` : "nonstop"}`,
            gateway: gw.code,
            carrier: c.code,
            flightNo,
            stops: c.stops,
            via: c.via,
            depMins: dep,
            travelMins: air,
            outFare,
            backFare,
            ground: g,
            groundEach,
            transferEach,
            totalEach: outFare + backFare + groundEach + transferEach,
            doorMins,
            leaveBy: dep - gw.security - g.mins,
            co2: Math.round(dist * (c.stops ? 0.23 : 0.2) + g.co2 * 2),
            transfers: c.stops + (g.label.includes("+") ? 2 : 1),
            score: 0,
            badges: [],
            bookUrl: googleFlights(gw.code, dest.airport.code, out, back),
          });
        }
      }
    }
  }
  if (prefs.includeGround || !dest.airport) {
    dest.groundRoutes.forEach((route, i) => {
      const r = seeded(`ground-${dest.place.id}-${i}-${out}`);
      const m = Math.min(demand(out), 1.3);
      const fare = route.splittable ? route.cost / group : route.cost;
      const outFare = Math.round(fare * (route.kind === "drive" ? 1 : m));
      const backFare = Math.round(fare * (route.kind === "drive" ? 1 : Math.min(demand(back), 1.3)));
      const dep = 7 * 60 + Math.floor(r() * 12) * 60 + 15;
      if (!inWindow(dep, prefs.window)) return;
      options.push({
        id: `ground-${dest.place.id}-${i}`,
        kind: route.kind,
        title: route.label,
        gateway: route.kind === "drive" ? "Campus" : "Union Station",
        carrier: null,
        flightNo: null,
        stops: 0,
        via: null,
        depMins: dep,
        travelMins: route.mins,
        outFare,
        backFare,
        ground: null,
        groundEach: 0,
        transferEach: 0,
        totalEach: outFare + backFare,
        doorMins: route.mins + (route.kind === "drive" ? 0 : 20),
        leaveBy: dep - (route.kind === "drive" ? 0 : 20),
        co2: route.co2 * 2,
        transfers: route.label.includes("+") ? 2 : 0,
        score: 0,
        badges: [],
        bookUrl: route.kind === "bus" ? "https://www.flixbus.com/" : route.kind === "train" ? "https://www.amtrak.com/" : "https://www.zipcar.com/",
      });
    });
  }
  return dedupe(options);
}
function dedupe(list: Option[]): Option[] {
  // For each flight keep the cheapest and the fastest way to the airport.
  const groups = new Map<string, Option[]>();
  for (const o of list) {
    const key = o.kind === "flight" ? `${o.gateway}-${o.carrier}` : o.id;
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }
  const out: Option[] = [];
  for (const arr of groups.values()) {
    const cheap = arr.reduce((a, b) => (b.totalEach < a.totalEach ? b : a));
    const fast = arr.reduce((a, b) => (b.doorMins < a.doorMins ? b : a));
    out.push(cheap);
    if (fast !== cheap) out.push(fast);
  }
  return out;
}

export type SortMode = "best" | "cheapest" | "fastest" | "greenest";

export function rank(options: Option[], mode: SortMode, moneyWeight: number): Option[] {
  if (!options.length) return [];
  const costs = options.map((o) => o.totalEach);
  const times = options.map((o) => o.doorMins);
  const [c0, c1, t0, t1] = [Math.min(...costs), Math.max(...costs), Math.min(...times), Math.max(...times)];
  const norm = (v: number, a: number, b: number) => (b === a ? 0 : (v - a) / (b - a));
  for (const o of options) {
    const penalty = o.stops * 0.07 + (o.leaveBy < 5 * 60 ? 0.12 : 0) + o.transfers * 0.02;
    o.score = Math.round(100 * (1 - (norm(o.totalEach, c0, c1) * moneyWeight + norm(o.doorMins, t0, t1) * (1 - moneyWeight) + penalty)));
    o.badges = [];
  }
  const by: Record<SortMode, (a: Option, b: Option) => number> = {
    best: (a, b) => b.score - a.score,
    cheapest: (a, b) => a.totalEach - b.totalEach || a.doorMins - b.doorMins,
    fastest: (a, b) => a.doorMins - b.doorMins || a.totalEach - b.totalEach,
    greenest: (a, b) => a.co2 - b.co2,
  };
  const label: [SortMode, string][] = [["best", "Best"], ["cheapest", "Cheapest"], ["fastest", "Fastest"], ["greenest", "Greenest"]];
  for (const [mode2, name] of label) {
    const top = [...options].sort(by[mode2])[0];
    if (top) top.badges.push(name);
  }
  return [...options].sort(by[mode]);
}

// Cheapest round trip door to door for a pair of dates.
export function cheapest(dest: Destination, out: string, back: string, prefs: Prefs, bookedOn = todayISO()): number | null {
  const list = search(dest, out, back, { ...prefs, window: "any" }, bookedOn);
  return list.length ? Math.min(...list.map((o) => o.totalEach)) : null;
}

export function calendar(dest: Destination, out: string, back: string, prefs: Prefs): { date: string; price: number | null }[] {
  const stay = Math.max(1, daysBetween(out, back));
  const today = todayISO();
  const days: { date: string; price: number | null }[] = [];
  for (let i = -5; i <= 6; i++) {
    const d = addDays(out, i);
    if (daysBetween(today, d) < 1) continue;
    days.push({ date: d, price: cheapest(dest, d, addDays(d, stay), prefs) });
  }
  return days;
}

export type Advice = {
  status: "now" | "good" | "wait" | "past";
  headline: string;
  bookBy: string | null;
  now: number | null;
  low: number | null;
  lowOn: string | null;
  curve: { day: number; price: number }[];
};

export function advice(dest: Destination, out: string, back: string, prefs: Prefs): Advice {
  const today = todayISO();
  const daysOut = daysBetween(today, out);
  const intl = !dest.domestic;
  const [lo, hi] = intl ? [60, 150] : [21, 70];
  const curve: { day: number; price: number }[] = [];
  for (let d = -21; d <= Math.min(daysOut - 1, 90); d += 3) {
    const p = cheapest(dest, out, back, prefs, addDays(today, d));
    if (p) curve.push({ day: d, price: p });
  }
  const future = curve.filter((p) => p.day >= 0);
  const now = future[0]?.price ?? null;
  const lowPoint = future.reduce<{ day: number; price: number } | null>((m, p) => (!m || p.price < m.price ? p : m), null);
  if (daysOut < 1) return { status: "past", headline: "That date has passed.", bookBy: null, now, low: null, lowOn: null, curve };
  if (!dest.airport) {
    return { status: "good", headline: "Trains and buses barely move in price. Book a week or two out.", bookBy: addDays(out, -10), now, low: lowPoint?.price ?? null, lowOn: null, curve };
  }
  if (daysOut < lo) {
    return {
      status: "now",
      headline: daysOut < 14 ? "Book today. Fares jump about 20% in the last week." : "You're past the cheap window. Book in the next few days.",
      bookBy: today, now, low: lowPoint?.price ?? null, lowOn: lowPoint ? addDays(today, lowPoint.day) : null, curve,
    };
  }
  if (daysOut <= hi) {
    return { status: "good", headline: "You're in the sweet spot. Fares are near their low.", bookBy: addDays(out, -lo), now, low: lowPoint?.price ?? null, lowOn: lowPoint ? addDays(today, lowPoint.day) : null, curve };
  }
  return { status: "wait", headline: "Early. Fares usually dip closer in, so set a fare alert.", bookBy: addDays(out, -hi), now, low: lowPoint?.price ?? null, lowOn: lowPoint ? addDays(today, lowPoint.day) : null, curve };
}

export function airportComparison(dest: Destination, out: string, back: string, prefs: Prefs) {
  return GATEWAYS.map((gw) => {
    const list = search(dest, out, back, { ...prefs, gateways: [gw.code], includeGround: false, window: "any" });
    if (!list.length) return { gw, price: null as number | null, mins: null as number | null, hidden: prefs.boycottAvelo && gw.code === "HVN" };
    return {
      gw,
      price: Math.min(...list.map((o) => o.totalEach)),
      mins: Math.min(...list.map((o) => o.doorMins)),
      hidden: false,
    };
  });
}

export function aveloCount(dest: Destination, out: string, back: string, prefs: Prefs): number {
  return search(dest, out, back, { ...prefs, boycottAvelo: false }).filter((o) => o.carrier === "XP").length;
}
