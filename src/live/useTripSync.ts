import { useEffect, useRef } from "react";
import { useReviewStore } from "../reviews/store";
import { useTripTable } from "../store";
import { syncTrips } from "./plans";

/**
 * Keeps a signed-in Yale student's trips in the database, so they count (anonymously)
 * toward the map's plan totals and follow them across devices.
 */
export function useTripSync() {
  const { state, dispatch } = useTripTable();
  const { session, shared } = useReviewStore();
  const timer = useRef<number | null>(null);
  const userId = shared && session && session.email ? session.userId : null;

  useEffect(() => {
    if (!userId) return;
    const uid = userId;
    let cancel = false;
    async function push() {
      const remoteOnly = await syncTrips(state.trips, uid);
      if (cancel || !remoteOnly.length) return;
      dispatch({
        type: "mergeTrips",
        trips: remoteOnly.map((r) => ({ id: r.id, placeId: r.place_id, season: r.season, start: r.start_date, end: r.end_date, note: "", friendNetids: [] })),
      });
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void push(), 800);
    const flush = () => void push();
    window.addEventListener("pagehide", flush);
    return () => {
      cancel = true;
      if (timer.current) window.clearTimeout(timer.current);
      window.removeEventListener("pagehide", flush);
    };
  }, [state.trips, userId, dispatch]);
}
