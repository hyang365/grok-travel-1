# Layouts

Single-page app. `src/App.tsx` `Shell` is the only shell. There is no router. `state.view` switches the body.

Desktop map (the default and the render branch to reproduce):

- Header `.topbar` 56px: Yale mark + "triptable", search, season select, nav (Map, Catalog, Study Abroad, Friends, Itinerary + badge), profile menu.
- Body `.workspace` grid `332px 1fr`.
- Left `.rail` FilterRail.
- Right `.map-stage` fills the rest. The amCharts map is `position:absolute; inset:0`.
- Over the map: `.map-mode` pill centered at the top (Travel | Study abroad), `.map-actions` top-right (Filters hidden on desktop, World), `.legend` bottom-left, `.panel` 420px floating on the right when a place or empty country is selected. Panel open shifts map padding and the mode pill left of the panel.

Study-abroad map mode drops the rail (`.workspace.no-rail`) and swaps the season select for a term select. The legend counts programs.

Catalog uses the same rail + a table instead of the map, with the same place panel.

Other views replace the workspace: AbroadView, FriendsView, ProfileView, or TripsShell (Trips / Flights / Buses & trains).

Mobile ≤960px: rail hides; Filters button opens it as a drawer. ≤760px: top bar wraps to two rows. ≤760px map actions drop below the mode pill.

Full shell source:

### `src/App.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { assertData } from "./data";
import { seasonLabel } from "./logic";
import { MapView } from "./MapView";
import { CatalogView, EmptyPanel, FilterRail, FriendsView, ItineraryView, PlacePanel } from "./ui";
import { StoreProvider, useCatalog, useTripTable } from "./store";
import { PLACE_BY_ID } from "./data";
import { FlightsView } from "./flights/FlightsView";
import { useTripSync } from "./live/useTripSync";
import { seasonYear } from "./live/plans";
import type { ViewName } from "./types";
import { LOGO } from "./logo";
import { AbroadView } from "./abroad/AbroadView";
import { AbroadMapPanel } from "./abroad/AbroadMapPanel";
import { TransitView } from "./transit/TransitView";
import { ProfileMenu } from "./profile/ProfileMenu";
import { ProfileView } from "./profile/ProfileView";
import { isUpcoming } from "./profile/trips";
import "./abroad/abroad.css";
import { reviews as reviewApi, useReviewStore } from "./reviews/store";
import { useAccount } from "./account/account";

const NAV: [ViewName, string][] = [
  ["map", "Map"],
  ["catalog", "Catalog"],
  ["abroad", "Study Abroad"],
  ["friends", "Friends"],
  ["itinerary", "Itinerary"],
];

const TRIP_TABS: [ViewName, string][] = [
  ["itinerary", "Trips"],
  ["flights", "Flights"],
  ["transit", "Buses & trains"],
];

function TripsShell() {
  const { state, dispatch } = useTripTable();
  return (
    <div className="trips-shell">
      <div className="trips-tabs" role="tablist" aria-label="Itinerary">
        {TRIP_TABS.map(([view, label]) => (
          <button key={view} type="button" role="tab" aria-selected={state.view === view} className={state.view === view ? "active" : ""} onClick={() => dispatch({ type: "setView", view })}>
            {label}
          </button>
        ))}
      </div>
      {state.view === "itinerary" ? <ItineraryView /> : null}
      {state.view === "flights" ? <FlightsView /> : null}
      {state.view === "transit" ? <TransitView /> : null}
    </div>
  );
}

function Shell() {
  const checked = useRef(false);
  if (!checked.current) {
    assertData();
    checked.current = true;
  }
  const { state, dispatch } = useTripTable();
  const { rows, total } = useCatalog();
  const [railOpen, setRailOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = state.selectedId ? (PLACE_BY_ID.get(state.selectedId) ?? null) : null;
  const abroadMap = state.mapMode === "abroad";
  const placesView = state.view === "map" || state.view === "catalog";
  const tripsView = state.view === "itinerary" || state.view === "flights" || state.view === "transit";
  const upcomingCount = state.trips.filter(isUpcoming).length;
  useTripSync();
  const panelOpen = abroadMap ? Boolean(state.abroadIso) : Boolean(selected || state.emptyGeo);

  useEffect(() => {
    document.title = `TripTable · ${seasonLabel(state.season)}`;
  }, [state.season]);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']") ?? document.createElement("link");
    link.rel = "icon";
    link.href = LOGO;
    if (!link.parentElement) document.head.appendChild(link);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        if (state.selectedId || state.emptyGeo) dispatch({ type: "select", id: null });
        setRailOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.emptyGeo, state.selectedId]);

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="sr">TripTable</h1>
        <button className="brand" type="button" onClick={() => dispatch({ type: "world" })}>
          <img className="brand-mark" src={LOGO} alt="" />
          <span className="brand-name">triptable</span>
        </button>
        {placesView ? (
        <input
          ref={searchRef}
          className="search"
          type="search"
          placeholder="Search places, countries, or spots"
          aria-label="Search places"
          value={state.filters.query}
          onChange={(event) => dispatch({ type: "patchFilters", patch: { query: event.target.value } })}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const first = rows[0];
            if (!first) return;
            dispatch({ type: "select", id: first.place.id });
            setRailOpen(false);
          }}
        />
        ) : (
          <span className="topbar-spacer" />
        )}
        {placesView ? (
        <label className="season-wrap">
          {abroadMap && state.view === "map" ? (
            <>
              <span className="sr">Term</span>
              <select
                className="season"
                aria-label="Study abroad term"
                value={state.abroadTerm}
                onChange={(event) => dispatch({ type: "setAbroadTerm", term: event.target.value as typeof state.abroadTerm })}
              >
                <option value="Fall">Fall semester</option>
                <option value="Spring">Spring semester</option>
                <option value="Summer">Summer</option>
              </select>
            </>
          ) : (
            <>
              <span className="sr">Season</span>
              <select
                className="season"
                aria-label="Season"
                value={state.season}
                onChange={(event) => dispatch({ type: "setSeason", season: event.target.value as typeof state.season })}
              >
                <option value="spring">Spring Break</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall Break</option>
                <option value="winter">Winter</option>
                <option value="weekend">Weekends</option>
              </select>
            </>
          )}
        </label>
        ) : null}
        <nav className="nav">
          {NAV.map(([view, label]) => {
            const active = view === "itinerary" ? tripsView : state.view === view;
            return (
              <button key={view} className={active ? "nav-btn active" : "nav-btn"} type="button" aria-current={active ? "page" : undefined} onClick={() => dispatch({ type: "setView", view })}>
                {view === "abroad" ? (
                  <>
                    <span className="nav-long">Study Abroad</span>
                    <span className="nav-short">Abroad</span>
                  </>
                ) : (
                  label
                )}
                {view === "itinerary" && upcomingCount ? <span className="badge">{upcomingCount}</span> : null}
              </button>
            );
          })}
        </nav>
        <ProfileMenu />
      </header>

      {state.view === "map" ? (
        <div className={abroadMap ? "workspace no-rail" : "workspace"}>
          {abroadMap ? null : <FilterRail open={railOpen} onPick={() => setRailOpen(false)} />}
          <div className={panelOpen ? "map-stage panel-open" : "map-stage"}>
            <MapView />
            <div className="map-mode" role="group" aria-label="Map layer">
              <button type="button" aria-pressed={!abroadMap} className={abroadMap ? "" : "active"} onClick={() => dispatch({ type: "setMapMode", mode: "travel" })}>
                Travel
              </button>
              <button type="button" aria-pressed={abroadMap} className={abroadMap ? "active" : ""} onClick={() => dispatch({ type: "setMapMode", mode: "abroad" })}>
                Study abroad
              </button>
            </div>
            {abroadMap ? (
              <div className="legend">
                <div className="legend-title">{state.abroadTerm === "Summer" ? "Summer" : `${state.abroadTerm} semester`} programs</div>
                <div className="legend-scale">
                  <span>1</span>
                  <i className="legend-bar" />
                  <span>More</span>
                </div>
                <div className="legend-total">Yale-run and Yale-approved programs offered this term</div>
              </div>
            ) : (
              <div className="legend">
                <div className="legend-title">
                  {seasonLabel(state.season)} {seasonYear(state.season)}
                </div>
                <div className="legend-scale">
                  <span>Fewer</span>
                  <i className="legend-bar" />
                  <span>More</span>
                </div>
                <div className="legend-total">
                  {total
                    ? `${total.toLocaleString("en-US")} ${total === 1 ? "student plan" : "student plans"}${state.filters.scope === "us" ? " in the U.S." : ""}`
                    : "No plans saved yet. Add yours from any place."}
                </div>
              </div>
            )}
            <div className="map-actions">
              {abroadMap ? null : (
                <button className="filters-toggle" type="button" onClick={() => setRailOpen((open) => !open)}>
                  Filters
                </button>
              )}
              <button type="button" onClick={() => dispatch({ type: "world" })}>
                World
              </button>
            </div>
            {abroadMap ? (
              state.abroadIso ? <AbroadMapPanel iso={state.abroadIso} /> : null
            ) : (
              <>
                {selected ? <PlacePanel place={selected} /> : null}
                {state.emptyGeo ? <EmptyPanel geo={state.emptyGeo} /> : null}
              </>
            )}
          </div>
        </div>
      ) : null}
      {state.view === "catalog" ? (
        <div className="workspace">
          <FilterRail open={railOpen} onPick={() => setRailOpen(false)} />
          <div className={panelOpen ? "map-stage catalog-stage panel-open" : "map-stage catalog-stage"}>
            <div className="map-actions catalog-actions">
              <button className="filters-toggle" type="button" onClick={() => setRailOpen((open) => !open)}>
                Filters
              </button>
            </div>
            <CatalogView />
            {selected ? <PlacePanel place={selected} /> : null}
          </div>
        </div>
      ) : null}
      {state.view === "abroad" ? <AbroadView /> : null}
      {state.view === "profile" ? <ProfileView /> : null}
      {state.view === "friends" ? <FriendsView /> : null}
      {tripsView ? <TripsShell /> : null}
      <AuthBanner />
      {state.toast ? (
        <div className="toast" role="status">
          {state.toast}
        </div>
      ) : null}
    </div>
  );
}

/** Shows a failed sign-in once, and welcomes a new account the first time it signs in. */
function AuthBanner() {
  const { authError } = useReviewStore();
  const { me } = useAccount();
  const { dispatch } = useTripTable();
  const greeted = useRef<string | null>(null);
  useEffect(() => {
    if (!me || greeted.current === me.id) return;
    greeted.current = me.id;
    try {
      if (sessionStorage.getItem("triptable-greeted") === me.id) return;
      sessionStorage.setItem("triptable-greeted", me.id);
    } catch {
      /* storage blocked */
    }
    const first = (me.full_name || me.email).split(/[\s.@]/)[0];
    dispatch({ type: "toast", message: `Signed in as ${first ? first[0].toUpperCase() + first.slice(1) : "you"}` });
  }, [me, dispatch]);
  if (!authError) return null;
  return (
    <div className="auth-banner" role="alert">
      <span>{authError}</span>
      <button type="button" className="textlink" onClick={() => reviewApi.clearAuthError()}>
        Dismiss
      </button>
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

```

Map layer switch styles:

### `src/abroad/abroad.css`

```css
.ab-page {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 420px) 1fr;
}
.ab-list, .ab-detail { overflow: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.ab-list { border-right: 1px solid var(--color-border); }
.ab-detail { max-width: 820px; gap: 14px; }
.ab-detail h2 { font-size: 22px; margin: 2px 0; }
.ab-detail h3 { font-size: 15px; margin-top: 6px; }
.ab-search { width: 100%; height: 34px; flex-shrink: 0; }
.ab-filters { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.ab-filters select, .ab-form select, .ab-form textarea {
  border: 1px solid var(--color-border-control);
  border-radius: 8px;
  background: var(--color-surface);
  height: 32px;
  padding: 0 6px;
  min-width: 0;
}
.ab-form textarea { height: auto; padding: 8px; resize: vertical; width: 100%; }
.ab-rows { display: flex; flex-direction: column; gap: 4px; }
.ab-rows button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  padding: 8px 10px;
}
.ab-rows button:hover { background: var(--color-surface-hover); }
.ab-rows button.active { border-color: var(--color-primary); background: var(--color-primary-subdued-2); }
.ab-row-main { display: flex; flex-direction: column; gap: 2px; }
.ab-row-main span, .ab-row-side .fine { color: var(--color-text-secondary); font-size: 12px; }
.ab-row-side { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.ab-score { font-weight: 650; }
.ab-score small { color: var(--color-text-tertiary); font-weight: 400; }
.ab-score.none { color: var(--color-text-tertiary); font-weight: 400; font-size: 12px; }
.ab-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ab-scores > div { border: 1px solid var(--color-border); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; }
.ab-grants, .ab-reviews { display: flex; flex-direction: column; gap: 8px; }
.ab-grants li, .ab-reviews li { border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
.ab-grants a { color: var(--color-primary); text-decoration: none; }
.ab-grant-top { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
.ab-amount { font-size: 12px; font-weight: 650; text-align: right; }
.ab-caveat { color: #b54708; }
.ab-link { display: inline-flex; align-items: center; text-decoration: none; }
.ab-write { width: fit-content; }
.ab-form { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; }
.ab-form-row { display: flex; flex-wrap: wrap; gap: 8px; }
.ab-form label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
@media (max-width: 820px) {
  .ab-page { grid-template-columns: 1fr; overflow: auto; }
  .ab-list { border-right: 0; border-bottom: 1px solid var(--color-border); overflow: visible; }
  .ab-detail { overflow: visible; }
  .ab-scores { grid-template-columns: repeat(2, 1fr); }
}
.map-mode {
  position: absolute;
  z-index: 3;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  padding: 3px;
  box-shadow: var(--shadow);
}
.map-mode button { border: 0; background: transparent; border-radius: 99px; height: 30px; padding: 0 14px; font-weight: 600; color: var(--color-text-secondary); }
.map-mode button.active { background: var(--color-primary); color: var(--color-on-primary); }
.map-stage.panel-open .map-mode { left: calc((100% - 432px) / 2); }
.ab-tag { text-transform: none; }
.panel .ab-rows button { padding: 8px 6px; }
.workspace.no-rail { grid-template-columns: 1fr; }
.map-mode button { white-space: nowrap; }
@media (max-width: 520px) { .map-mode button { padding: 0 10px; font-size: 13px; } }

```
