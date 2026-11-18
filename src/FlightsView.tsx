import { useEffect, useMemo, useRef, useState } from "react";
import { DIRECTORY, PLACE_BY_ID, PLACES } from "../data";
import { formatMoney, formatRange, travelGuidance } from "../logic";
import { useFriends, useTripTable } from "../store";
import type { Place, Trip } from "../types";
import {
  AIRLINES,
  BREAKS,
  GATEWAYS,
  addDays,
  advice,
  airportComparison,
  aveloCount,
  calendar,
  clock,
  daysBetween,
  duration,
  rank,
  resolveDestination,
  search,
  todayISO,
  type Option,
  type Prefs,
  type SortMode,
} from "./engine";
import { ALL_GATEWAYS, flightStore, useFlights } from "./flightStore";
import "./flights.css";

const SEARCHABLE = PLACES.filter((p) => p.id !== "us");

// ---------- small exported pieces used elsewhere in the app ----------

/** Top-bar switch. Hides every Avelo flight across the flight finder. */
export function AveloToggle() {
  const fs = useFlights();
  const { dispatch } = useTripTable();
  return (
    <label className={fs.boycottAvelo ? "fl-avelo on" : "fl-avelo"} title="Hide every Avelo flight (Tweed's main airline)">
      <input
        type="checkbox"
        checked={fs.boycottAvelo}
        onChange={(e) => {
          flightStore.set({ boycottAvelo: e.target.checked });
          dispatch({ type: "toast", message: e.target.checked ? "Avelo boycott on. Avelo flights hidden." : "Avelo flights visible again" });
        }}
      />
      <span className="fl-switch" aria-hidden="true" />
      <span className="fl-avelo-text">{fs.boycottAvelo ? "Boycotting Avelo" : "Boycott Avelo"}</span>
    </label>
  );
}

/** Button for the place panel: jumps to the Flights tab with this place filled in. */
export function FindFlightsButton({ placeId }: { placeId: string }) {
  const { dispatch } = useTripTable();
  return (
    <button
      type="button"
      className="primary fl-find"
      onClick={() => {
        flightStore.set({ destId: placeId, out: null, back: null });
        dispatch({ type: "setView", view: "flights" });
      }}
    >
      ✈ Find flights from Yale
    </button>
  );
}

// ---------- date helpers ----------
function rollForward(start: string, end: string): [string, string] {
  let s = start;
  let e = end;
  const today = todayISO();
  for (let i = 0; i < 5 && daysBetween(today, s) < 1; i++) {
    s = `${Number(s.slice(0, 4)) + 1}${s.slice(4)}`;
    e = `${Number(e.slice(0, 4)) + 1}${e.slice(4)}`;
  }
  return [s, e];
}

function defaultDates(place: Place, trips: Trip[], season: string): [string, string] {
  const trip = trips.find((t) => t.placeId === place.id || t.placeId === place.parentId);
  if (trip) return rollForward(trip.start, trip.end);
  const cohort = place.cohorts.find((c) => c.season === season) ?? place.cohorts[0];
  if (cohort) return rollForward(cohort.start, cohort.end);
  const spring = BREAKS.find((b) => b.id === "spr");
  return spring ? [spring.start, addDays(spring.start, 7)] : [addDays(todayISO(), 30), addDays(todayISO(), 37)];
}

const shortDate = (iso: string) => formatRange(iso, iso).replace(/–\d+$/, "");

// ---------- main view ----------
export function FlightsView() {
  const { state, dispatch } = useTripTable();
  const friends = useFriends();
  const fs = useFlights();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // pick a sensible destination if none chosen yet
  const place: Place | null = (fs.destId ? PLACE_BY_ID.get(fs.destId) : null) ?? (state.trips[0] ? PLACE_BY_ID.get(state.trips[0].placeId) ?? null : null);

  const [out, back] = useMemo<[string, string]>(() => {
    if (fs.out && fs.back && daysBetween(todayISO(), fs.out) >= 1) return [fs.out, fs.back];
    if (!place) return [addDays(todayISO(), 30), addDays(todayISO(), 37)];
    return defaultDates(place, state.trips, state.season);
  }, [fs.out, fs.back, place, state.trips, state.season]);

  const dest = useMemo(() => (place ? resolveDestination(place) : null), [place]);
  const guidance = place ? travelGuidance(place.iso) : null;
  const blocked = guidance?.level === "blocked";

  const prefs: Prefs = {
    gateways: fs.gateways,
    boycottAvelo: fs.boycottAvelo,
    nonstopOnly: fs.nonstopOnly,
    includeGround: fs.includeGround,
    window: fs.window,
    groupSize: fs.crew.length + 1,
  };
  const prefsKey = JSON.stringify(prefs);

  const results = useMemo(() => {
    if (!dest || blocked) return [];
    return rank(search(dest, out, back, prefs), fs.sort, fs.moneyWeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest, out, back, prefsKey, fs.sort, fs.moneyWeight, blocked]);

  const side = useMemo(() => {
    if (!dest || blocked) return null;
    return {
      advice: advice(dest, out, back, prefs),
      cal: calendar(dest, out, back, prefs),
      airports: airportComparison(dest, out, back, prefs),
      avelo: fs.boycottAvelo ? aveloCount(dest, out, back, prefs) : 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest, out, back, prefsKey, blocked]);

  // friends whose trips overlap this destination and dates
  const overlapping = useMemo(() => {
    if (!place) return [];
    return DIRECTORY.flatMap((person) =>
      person.trips
        .filter((t) => {
          const p = PLACE_BY_ID.get(t.placeId);
          const same = t.placeId === place.id || p?.parentId === place.id || place.parentId === t.placeId;
          if (!same) return false;
          const [s, e] = rollForward(t.start, t.end);
          return daysBetween(s, back) >= 0 && daysBetween(out, e) >= 0;
        })
        .map((t) => ({ person, trip: t, isFriend: state.friendNetids.includes(person.netid) })),
    ).sort((a, b) => Number(b.isFriend) - Number(a.isFriend));
  }, [place, out, back, state.friendNetids]);

  const matches = query.trim()
    ? SEARCHABLE.filter((p) => {
        const q = query.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.aliases.some((a) => a.includes(q));
      }).slice(0, 8)
    : SEARCHABLE.filter((p) => state.trips.some((t) => t.placeId === p.id)).concat(SEARCHABLE.slice(0, 6)).slice(0, 8);

  function setDates(o: string, b: string) {
    flightStore.set({ out: o, back: daysBetween(o, b) >= 0 ? b : addDays(o, 7) });
    setShowAll(false);
  }

  function saveFlight(o: Option) {
    if (!place) return;
    const line = o.flightNo ? `✈ ${o.flightNo} from ${o.gateway}, leave campus ${clock(o.leaveBy)}, ${formatMoney(o.totalEach)} pp` : `🚆 ${o.title}, ${formatMoney(o.totalEach)} pp`;
    flightStore.set((s) => ({
      saved: [
        { id: `${Date.now()}`, placeId: place.id, title: o.title, gateway: o.gateway, flightNo: o.flightNo, out, back, totalEach: o.totalEach, leaveBy: clock(o.leaveBy) },
        ...s.saved.filter((x) => !(x.placeId === place.id && x.out === out)),
      ],
    }));
    const existing = state.trips.find((t) => t.placeId === place.id);
    const trip: Trip = existing
      ? { ...existing, start: out, end: back, note: [existing.note.replace(/\n?[✈🚆].*$/u, ""), line].filter(Boolean).join("\n") }
      : { id: `trip-${place.id}-${Date.now()}`, placeId: place.id, season: state.season, start: out, end: back, note: line, friendNetids: fs.crew };
    dispatch({ type: "saveTrip", trip, message: `Saved ${o.flightNo ?? o.title} to your itinerary` });
  }

  function watch(o: Option) {
    if (!place) return;
    flightStore.set((s) => ({ alerts: [{ id: `${Date.now()}`, placeId: place.id, out, back, price: o.totalEach }, ...s.alerts.filter((a) => !(a.placeId === place.id && a.out === out))] }));
    dispatch({ type: "toast", message: `Watching fares to ${place.name}` });
    if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    // Demo: simulate a drop so the alert flow can be shown live.
    const name = place.name;
    timers.current.push(
      window.setTimeout(() => {
        const drop = Math.max(9, Math.round(o.totalEach * 0.08));
        const msg = `Price drop: ${name} now ${formatMoney(o.totalEach - drop)} (−${formatMoney(drop)})`;
        dispatch({ type: "toast", message: msg });
        if ("Notification" in window && Notification.permission === "granted") new Notification("TripTable fare alert", { body: msg });
      }, 8000),
    );
  }

  const visible = showAll ? results : results.slice(0, 6);
  const upcomingBreaks = BREAKS.filter((b) => daysBetween(todayISO(), b.end) > 0);

  return (
    <div className="fl-page">
      <header className="fl-head">
        <div>
          <h2>Flights</h2>
          <p className="lede">Door to door from Old Campus: the ride to the airport, the flight, and the way back. Round-trip, per person.</p>
        </div>
      </header>

      {/* ---------- search bar ---------- */}
      <section className="fl-search">
        <div className="fl-field fl-dest">
          <span className="field-label">To</span>
          <input
            value={open ? query : place ? place.name : query}
            placeholder="Where to? Try Puerto Rico, Lisbon, Tokyo"
            onFocus={() => {
              setOpen(true);
              setQuery("");
            }}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches[0]) {
                flightStore.set({ destId: matches[0].id, out: null, back: null });
                setOpen(false);
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          {open ? (
            <ul className="fl-drop">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      flightStore.set({ destId: p.id, out: null, back: null });
                      setOpen(false);
                      setShowAll(false);
                    }}
                  >
                    <span>{p.name}</span>
                    <span className="fl-muted">{p.kind === "country" ? "Country" : p.region}</span>
                  </button>
                </li>
              ))}
              {!matches.length ? <li className="fl-muted fl-pad">No match in TripTable yet</li> : null}
            </ul>
          ) : null}
        </div>
        <label className="fl-field">
          <span className="field-label">Leave</span>
          <input type="date" value={out} min={addDays(todayISO(), 1)} onChange={(e) => e.target.value && setDates(e.target.value, back)} />
        </label>
        <label className="fl-field">
          <span className="field-label">Return</span>
          <input type="date" value={back} min={out} onChange={(e) => e.target.value && setDates(out, e.target.value)} />
        </label>
        <div className="fl-breaks">
          {upcomingBreaks.map((b) => (
            <button key={b.id} type="button" className={out === b.start ? "on" : ""} onClick={() => setDates(b.start, b.id === "win" || b.id === "sum" ? addDays(b.start, 14) : b.end)}>
              {b.label}
            </button>
          ))}
        </div>
      </section>

      <section className="fl-toolbar">
        <div className="seg fl-seg">
          {(["best", "cheapest", "fastest", "greenest"] as SortMode[]).map((m) => (
            <button key={m} type="button" className={fs.sort === m ? "active" : ""} onClick={() => flightStore.set({ sort: m })}>
              {m === "best" ? "Best" : m === "cheapest" ? "Cheapest" : m === "fastest" ? "Fastest" : "Greenest"}
            </button>
          ))}
        </div>
        <div className="fl-crew">
          <span className="field-label">Flying with</span>
          {friends.length ? (
            friends.map((f) => (
              <button
                key={f.netid}
                type="button"
                className={fs.crew.includes(f.netid) ? "fl-chip on" : "fl-chip"}
                onClick={() => flightStore.set((s) => ({ crew: s.crew.includes(f.netid) ? s.crew.filter((x) => x !== f.netid) : [...s.crew, f.netid] }))}
              >
                {f.name.split(" ")[0]}
              </button>
            ))
          ) : (
            <span className="fl-muted">Add friends to split rides</span>
          )}
        </div>
        <button type="button" className={showFilters ? "fl-ghost on" : "fl-ghost"} onClick={() => setShowFilters((v) => !v)}>
          Filters{fs.nonstopOnly || fs.window !== "any" || fs.gateways.length < ALL_GATEWAYS.length ? " •" : ""}
        </button>
      </section>

      {showFilters ? (
        <section className="fl-filters">
          <div className="fl-frow">
            <span className="field-label">Airports</span>
            <div className="choice-row">
              {GATEWAYS.map((g) => {
                const on = fs.gateways.includes(g.code);
                return (
                  <button
                    key={g.code}
                    type="button"
                    className={on ? "on" : ""}
                    title={`${g.name}, ${g.city}`}
                    onClick={() =>
                      flightStore.set((s) => {
                        const next = on ? s.gateways.filter((x) => x !== g.code) : [...s.gateways, g.code];
                        return { gateways: next.length ? next : s.gateways };
                      })
                    }
                  >
                    {g.code}
                    {g.code === "HVN" && fs.boycottAvelo ? " (Avelo off)" : ""}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="fl-frow">
            <span className="field-label">Departs</span>
            <div className="choice-row">
              {(["any", "morning", "afternoon", "evening"] as const).map((w) => (
                <button key={w} type="button" className={fs.window === w ? "on" : ""} onClick={() => flightStore.set({ window: w })}>
                  {w[0]?.toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="fl-frow">
            <label className="check">
              <input type="checkbox" checked={fs.nonstopOnly} onChange={(e) => flightStore.set({ nonstopOnly: e.target.checked })} /> Nonstop only
            </label>
            <label className="check">
              <input type="checkbox" checked={fs.includeGround} onChange={(e) => flightStore.set({ includeGround: e.target.checked })} /> Include trains, buses, driving
            </label>
          </div>
          <div className="fl-frow">
            <span className="field-label">“Best” leans toward</span>
            <span className="fl-muted">time</span>
            <input type="range" min={0} max={100} value={Math.round(fs.moneyWeight * 100)} onChange={(e) => flightStore.set({ moneyWeight: Number(e.target.value) / 100 })} />
            <span className="fl-muted">money</span>
          </div>
        </section>
      ) : null}

      {/* ---------- body ---------- */}
      {!place ? (
        <p className="fl-empty">Pick a destination above, or open any place on the map and press “Find flights”.</p>
      ) : blocked && guidance ? (
        <div className="guidance blocked fl-blocked">
          <strong>{guidance.title}.</strong> {guidance.detail} Flight search is off for {place.name}.
        </div>
      ) : (
        <div className="fl-grid">
          <div className="fl-results">
            <p className="fl-summary">
              <strong>{results.length} ways</strong> from Yale to {place.name}
              {dest?.airport ? ` (${dest.airport.code})` : ""} · {formatRange(out, back)}
              {fs.crew.length ? ` · ${fs.crew.length + 1} people, Ubers split` : ""}
            </p>
            {guidance && guidance.level === "regional" ? <div className="guidance regional">{guidance.title}. {guidance.detail}</div> : null}
            {overlapping.length ? (
              <div className="fl-overlap">
                {overlapping.slice(0, 3).map(({ person, trip, isFriend }) => (
                  <div key={person.netid + trip.start}>
                    <strong>{isFriend ? person.name : `A ${person.college} student`}</strong> is there {formatRange(...rollForward(trip.start, trip.end))}.
                    {isFriend && !fs.crew.includes(person.netid) ? (
                      <button type="button" className="textlink" onClick={() => flightStore.set((s) => ({ crew: [...s.crew, person.netid] }))}>
                        Fly together
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {results.length === 0 ? <p className="fl-empty">Nothing matches these filters. Turn on more airports or allow stops.</p> : null}
            <ul className="fl-list">
              {visible.map((o, i) => (
                <OptionCard key={o.id} o={o} top={i === 0} destCode={dest?.airport?.code ?? place.name} transfer={dest?.transfer ?? null} onSave={() => saveFlight(o)} onWatch={() => watch(o)} />
              ))}
            </ul>
            {!showAll && results.length > 6 ? (
              <button type="button" className="fl-more" onClick={() => setShowAll(true)}>
                Show {results.length - 6} more
              </button>
            ) : null}
            {side && side.avelo > 0 ? <p className="fl-hidden">✊ {side.avelo} Avelo option{side.avelo > 1 ? "s" : ""} hidden by your boycott.</p> : null}
          </div>

          {side ? (
            <aside className="fl-side">
              <AdviceCard a={side.advice} />
              <div className="fl-card">
                <h3>Flexible dates</h3>
                <p className="fl-muted fl-small">Same trip length, shifted. Cheapest in green.</p>
                <CalendarStrip days={side.cal} out={out} onPick={(d) => setDates(d, addDays(d, daysBetween(out, back)))} />
              </div>
              <div className="fl-card">
                <h3>Which airport?</h3>
                <p className="fl-muted fl-small">Cheapest round trip including the ride there and back.</p>
                <AirportTable rows={side.airports} onPick={(code) => flightStore.set({ gateways: [code] })} />
                {fs.gateways.length < ALL_GATEWAYS.length ? (
                  <button type="button" className="textlink" onClick={() => flightStore.set({ gateways: ALL_GATEWAYS })}>
                    Show all airports
                  </button>
                ) : null}
              </div>
              <SavedCard />
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ---------- pieces ----------
function OptionCard({
  o,
  top,
  destCode,
  transfer,
  onSave,
  onWatch,
}: {
  o: Option;
  top: boolean;
  destCode: string;
  transfer: { label: string; mins: number } | null;
  onSave: () => void;
  onWatch: () => void;
}) {
  const air = o.carrier ? AIRLINES[o.carrier] : null;
  return (
    <li className={top ? "fl-opt top" : "fl-opt"}>
      <div className="fl-opt-main">
        <div className="fl-opt-title">
          {air ? <i className="fl-dot" style={{ background: air.color }} /> : <span>{o.kind === "bus" ? "🚌" : o.kind === "drive" ? "🚗" : o.kind === "ferry" ? "⛴" : "🚆"}</span>}
          <strong>{o.title}</strong>
          {o.kind === "flight" ? <span className="fl-muted">from {o.gateway}</span> : null}
          {o.badges.map((b) => (
            <span key={b} className={`fl-badge b-${b.toLowerCase()}`}>
              {b}
            </span>
          ))}
        </div>
        <div className="fl-legs">
          {o.ground ? <span className="fl-leg">{o.ground.label} · {duration(o.ground.mins)}</span> : null}
          {o.kind === "flight" ? (
            <span className="fl-leg">
              {o.flightNo} · {o.gateway} → {o.via ? `${o.via} → ` : ""}
              {destCode} · {duration(o.travelMins)}
            </span>
          ) : (
            <span className="fl-leg">{duration(o.travelMins)}</span>
          )}
          {transfer && o.kind === "flight" ? <span className="fl-leg">{transfer.label} · {duration(transfer.mins)}</span> : null}
        </div>
        <div className="fl-meta">
          <span>
            Leave campus <b>{clock(o.leaveBy)}</b>
          </span>
          <span>
            Departs <b>{clock(o.depMins)}</b>
          </span>
          <span>
            <b>{duration(o.doorMins)}</b> door to door
          </span>
          <span>{o.co2} kg CO₂</span>
        </div>
      </div>
      <div className="fl-opt-side">
        <div className="fl-price">{formatMoney(o.totalEach)}</div>
        <div className="fl-muted fl-small">
          {o.kind === "flight" ? `fares ${formatMoney(o.outFare + o.backFare)} + rides ${formatMoney(o.groundEach + o.transferEach)}` : `${formatMoney(o.outFare)} each way`}
        </div>
        <div className="fl-actions">
          <button type="button" className="fl-ghost" title="Alert me if this gets cheaper" onClick={onWatch}>
            🔔
          </button>
          <button type="button" className="fl-ghost" onClick={onSave}>
            Save
          </button>
          <a className="primary fl-book" href={o.bookUrl} target="_blank" rel="noreferrer">
            Book ↗
          </a>
        </div>
      </div>
    </li>
  );
}

function AdviceCard({ a }: { a: ReturnType<typeof advice> }) {
  const label = { now: "Book now", good: "Good time to book", wait: "Wait", past: "Past" }[a.status];
  const pts = a.curve;
  const W = 280;
  const H = 90;
  const P = 10;
  let chart = null;
  if (pts.length > 2) {
    const xs = pts.map((p) => p.day);
    const ys = pts.map((p) => p.price);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys) * 0.96, Math.max(...ys) * 1.04];
    const X = (v: number) => P + ((v - x0) / (x1 - x0 || 1)) * (W - 2 * P);
    const Y = (v: number) => H - P - ((v - y0) / (y1 - y0 || 1)) * (H - 2 * P);
    const line = (arr: typeof pts) => arr.map((p) => `${X(p.day).toFixed(1)},${Y(p.price).toFixed(1)}`).join(" ");
    const past = pts.filter((p) => p.day <= 0);
    const fut = pts.filter((p) => p.day >= 0);
    const low = fut.reduce<(typeof pts)[number] | null>((m, p) => (!m || p.price < m.price ? p : m), null);
    chart = (
      <svg className="fl-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Fare forecast">
        <polyline points={line(past)} fill="none" stroke="var(--color-track)" strokeWidth="2" strokeDasharray="4 4" />
        <polyline points={line(fut)} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
        <line x1={X(0)} x2={X(0)} y1={P} y2={H - P} stroke="var(--color-border)" />
        {low ? <circle cx={X(low.day)} cy={Y(low.price)} r="4" fill="#0b7a32" /> : null}
      </svg>
    );
  }
  return (
    <div className="fl-card">
      <span className={`fl-status s-${a.status}`}>{label}</span>
      <p className="fl-headline">{a.headline}</p>
      {chart}
      {chart ? <p className="fl-muted fl-small">Dashed: last 3 weeks. Blue: forecast by booking day. Green dot: predicted low.</p> : null}
      <dl className="fl-kv">
        <div>
          <dt>Cheapest today</dt>
          <dd>{a.now ? formatMoney(a.now) : "—"}</dd>
        </div>
        {a.low && a.lowOn ? (
          <div>
            <dt>Predicted low</dt>
            <dd>
              {formatMoney(a.low)} <span className="fl-muted">if booked {shortDate(a.lowOn)}</span>
            </dd>
          </div>
        ) : null}
        {a.bookBy ? (
          <div>
            <dt>Book by</dt>
            <dd>{shortDate(a.bookBy)}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function CalendarStrip({ days, out, onPick }: { days: { date: string; price: number | null }[]; out: string; onPick: (d: string) => void }) {
  const prices = days.map((d) => d.price).filter((p): p is number => p !== null).sort((a, b) => a - b);
  const lo = prices[Math.floor(prices.length / 3)] ?? 0;
  const hi = prices[Math.floor((prices.length * 2) / 3)] ?? Infinity;
  return (
    <div className="fl-cal">
      {days.map((d) => {
        const dt = new Date(`${d.date}T12:00:00Z`);
        const cls = d.price === null ? "" : d.price <= lo ? "lo" : d.price >= hi ? "hi" : "";
        return (
          <button key={d.date} type="button" className={`${cls} ${d.date === out ? "sel" : ""}`} onClick={() => onPick(d.date)}>
            <span>{dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })} {dt.getUTCDate()}</span>
            <b>{d.price ? formatMoney(d.price) : "—"}</b>
          </button>
        );
      })}
    </div>
  );
}

function AirportTable({ rows, onPick }: { rows: ReturnType<typeof airportComparison>; onPick: (code: string) => void }) {
  const best = Math.min(...rows.map((r) => r.price ?? Infinity));
  return (
    <table className="fl-airports">
      <tbody>
        {rows.map((r) => (
          <tr key={r.gw.code} className={r.price === best ? "best" : ""} onClick={() => r.price && onPick(r.gw.code)}>
            <td>
              <b>{r.gw.code}</b> <span className="fl-muted">{r.gw.name}</span>
            </td>
            <td className="fl-num">{r.price ? formatMoney(r.price) : r.hidden ? "boycotted" : "no flights"}</td>
            <td className="fl-num fl-muted">{r.mins ? duration(r.mins) : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SavedCard() {
  const fs = useFlights();
  const { dispatch } = useTripTable();
  if (!fs.saved.length && !fs.alerts.length) return null;
  return (
    <div className="fl-card">
      <h3>Saved & watching</h3>
      <ul className="fl-saved">
        {fs.saved.map((s) => (
          <li key={s.id}>
            <div>
              <b>{PLACE_BY_ID.get(s.placeId)?.name}</b> · {formatRange(s.out, s.back)}
              <div className="fl-muted fl-small">
                {s.flightNo ?? s.title} from {s.gateway} · leave {s.leaveBy}
              </div>
            </div>
            <span className="fl-num">{formatMoney(s.totalEach)}</span>
            <button type="button" className="icon-btn" aria-label="Remove" onClick={() => flightStore.set((st) => ({ saved: st.saved.filter((x) => x.id !== s.id) }))}>
              ×
            </button>
          </li>
        ))}
        {fs.alerts.map((a) => (
          <li key={a.id}>
            <div>
              🔔 <b>{PLACE_BY_ID.get(a.placeId)?.name}</b> · {formatRange(a.out, a.back)}
              <div className="fl-muted fl-small">Alert below {formatMoney(a.price)}</div>
            </div>
            <span />
            <button
              type="button"
              className="icon-btn"
              aria-label="Stop watching"
              onClick={() => {
                flightStore.set((st) => ({ alerts: st.alerts.filter((x) => x.id !== a.id) }));
                dispatch({ type: "toast", message: "Alert removed" });
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
