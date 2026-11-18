# Pages

## Map (default view)
Entry: `src/App.tsx` Shell, branch `state.view === "map"`
Dependencies:
- src/App.tsx
  - src/MapView.tsx
  - src/ui.tsx (FilterRail, PlacePanel, EmptyPanel)
    - src/reviews/ReviewSection.tsx
    - src/profile/ProfileMenu.tsx (BucketButton)
    - src/flights/FlightsView.tsx (FindFlightsButton, GroupFlightSummary)
  - src/abroad/AbroadMapPanel.tsx
  - src/abroad/abroad.css (.map-mode)
  - src/profile/ProfileMenu.tsx
  - src/styles.css
- src/logo.ts (header mark)

## Catalog
Entry: `src/App.tsx` branch `state.view === "catalog"`
- src/ui.tsx CatalogView, FilterRail, PlacePanel
- src/styles.css

## Study Abroad
Entry: `src/abroad/AbroadView.tsx`
- src/abroad/abroad.css
- src/abroad/data.ts
- src/reviews/ReviewSection.tsx

## Friends
Entry: `src/ui.tsx` FriendsView
- src/styles.css
- src/reviews/ReviewSection.tsx SignInBox

## Itinerary / Flights / Transit
Entry: `src/App.tsx` TripsShell
- src/ui.tsx ItineraryView
- src/flights/FlightsView.tsx
- src/flights/flights.css
- src/transit/TransitView.tsx
- src/transit/transit.css

## Profile
Entry: `src/profile/ProfileView.tsx`
- src/profile/profile.css
- src/profile/ProfileMenu.tsx
