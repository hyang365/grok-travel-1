# Routes

No URL router. Navigation is `ViewName` in client state (`src/types.ts`, `src/store.tsx`, `src/App.tsx`).

| View | Label | What renders |
| --- | --- | --- |
| map | Map | FilterRail + MapView + legend, mode switch, place or abroad panel. Default. |
| catalog | Catalog | FilterRail + sortable place table + PlacePanel |
| abroad | Study Abroad | AbroadView program browser |
| friends | Friends | FriendsView |
| itinerary | Itinerary | TripsShell: Trips, Flights, Buses & trains |
| flights | (tab) | FlightsView inside TripsShell |
| transit | (tab) | TransitView inside TripsShell |
| profile | (menu) | ProfileView |

The live site is `https://hyang365.github.io/grok-travel-1/`. Vite `base` is `/grok-travel-1/` when `GITHUB_PAGES=true`.

Map behavior that the redesign must keep:

- Click a country to select it and open the place panel. Countries with no TripTable record open EmptyPanel.
- Click a city dot to select that spot. US spots stay visible; other spots appear when their country is selected.
- Friend dots are amber and only when "Show friends on the map" is on.
- Country fill is a heat scale of how many students are planning that place this season. Empty land is neutral gray, not red.
- Wheel zoom step 1.08, max zoom 40, Mercator, Antarctica excluded, home view centered near the Atlantic.
- "World" resets the view. Escape closes the panel.
