// Live, anonymous plan counts built only from trips Yale students save while signed in.
// The database returns totals per place/season/year (public.plan_counts) and never who.

import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "../reviews/backend";
import type { Season, Trip } from "../types";

type Snapshot = { counts: Map<string, number>; loaded: boolean; version: number };

let snap: Snapshot = { counts: new Map(), loaded: false, version: 0 };
const listeners = new Set<() => void>();
const key = (placeId: string, season: string, year: number) => `${placeId}|${season}|${year}`;

export async function refreshPlans() {
  if (!supabase) {
    snap = { ...snap, loaded: true, version: snap.version + 1 };
    listeners.forEach((fn) => fn());
    return;
  }
  const { data, error } = await supabase.rpc("plan_counts");
  if (error || !Array.isArray(data)) {
    snap = { ...snap, loaded: true, version: snap.version + 1 };
    listeners.forEach((fn) => fn());
    return;
  }
  const counts = new Map<string, number>();
  for (const row of data as { place_id: string; season: string; year: number; plans: number }[]) {
    counts.set(key(row.place_id, row.season, row.year), row.plans);
  }
  snap = { counts, loaded: true, version: snap.version + 1 };
  listeners.forEach((fn) => fn());
}

let started = false;
function start() {
  if (started) return;
  started = true;
  void refreshPlans();
  window.setInterval(() => {
    if (document.visibilityState === "visible") void refreshPlans();
  }, 60_000);
}

export const plansStore = {
  subscribe(fn: () => void) {
    start();
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  get: () => snap,
};

export function usePlans(): Snapshot {
  return useSyncExternalStore(plansStore.subscribe, plansStore.get, plansStore.get);
}

/** Students planning this exact place (not including spots inside it). */
export function planCount(placeId: string, season: Season, year: number): number {
  return snap.counts.get(key(placeId, season, year)) ?? 0;
}

/**
 * The year a season's next (or current) occurrence falls in, so "Spring Break" in November
 * means next March. Winter break counts by the December it starts in.
 */
export function seasonYear(season: Season, now = new Date()): number {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (season === "spring") return m > 3 ? y + 1 : y;
  if (season === "summer") return m > 8 ? y + 1 : y;
  if (season === "fall") return m > 10 ? y + 1 : y;
  if (season === "winter") return m === 1 ? y - 1 : y;
  return y;
}

/** How many other students overlap the given dates at a place. Null while loading or offline. */
export function useOverlap(placeId: string | null, start?: string, end?: string): number | null {
  const [n, setN] = useState<number | null>(null);
  const { version } = usePlans();
  useEffect(() => {
    let alive = true;
    setN(null);
    if (!supabase || !placeId || !start || !end) return;
    supabase.rpc("overlap_count", { p_place: placeId, p_start: start, p_end: end }).then(({ data, error }) => {
      if (alive && !error && typeof data === "number") setN(data);
    });
    return () => {
      alive = false;
    };
  }, [placeId, start, end, version]);
  return n;
}

// ---------- syncing your own trips (signed-in Yale accounts only) ----------
type Row = { id: string; place_id: string; season: Season; start_date: string; end_date: string };

const SYNCED_KEY = "triptable-synced-trip-ids";

/** Trip ids this browser has successfully synced. Persisted so a reload still knows a missing id was deleted here, not added on another device. */
function readSynced(): Set<string> {
  try {
    const raw = localStorage.getItem(SYNCED_KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(data) ? data.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSynced(ids: Iterable<string>) {
  try {
    localStorage.setItem(SYNCED_KEY, JSON.stringify([...ids]));
  } catch {
    /* storage blocked */
  }
}

let chain: Promise<Row[]> = Promise.resolve([]);

async function syncOnce(trips: Trip[], userId: string): Promise<Row[]> {
  if (!supabase) return [];
  const sig = (t: { place_id: string; season: string; start_date: string; end_date: string }) => `${t.place_id}|${t.season}|${t.start_date}|${t.end_date}`;
  const { data, error } = await supabase.from("trips").select("id,place_id,season,start_date,end_date");
  if (error) return [];
  const known = readSynced();
  const remote = new Map((data as Row[]).map((r) => [r.id, r]));
  const local = new Map(trips.map((t) => [t.id, { id: t.id, place_id: t.placeId, season: t.season, start_date: t.start, end_date: t.end }]));

  const removed = [...remote.keys()].filter((id) => !local.has(id) && known.has(id));
  if (removed.length) {
    const { error: deleteError } = await supabase.from("trips").delete().in("id", removed);
    if (deleteError) return [];
  }

  const upserts = [...local.values()].filter((r) => !remote.has(r.id) || sig(remote.get(r.id)!) !== sig(r));
  if (upserts.length) {
    const { error: upsertError } = await supabase.from("trips").upsert(upserts.map((r) => ({ ...r, user_id: userId, updated_at: new Date().toISOString() })));
    if (upsertError) return [];
  }

  writeSynced(local.keys());
  if (upserts.length || removed.length) void refreshPlans();
  return [...remote.values()].filter((r) => !local.has(r.id) && !removed.includes(r.id));
}

/** Push local trips to the database and remove ones you deleted. Returns trips that exist only remotely. */
export function syncTrips(trips: Trip[], userId: string): Promise<Row[]> {
  const run = chain.then(() => syncOnce(trips, userId));
  chain = run.then(
    () => [],
    () => [],
  );
  return run;
}
