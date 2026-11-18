# Extractable components

## TopBar
- Source: `src/App.tsx` (header.topbar inside Shell)
- Category: layout
- Description: Brand, search, season or term select, primary nav, profile menu
- Extractable props: activeItem (string, default "map"), season (string, default "spring"), query (string, default ""), upcomingCount (number, default 0)
- Hardcoded: brand word "triptable", nav labels Map / Catalog / Study Abroad / Friends / Itinerary, logo image

## FilterRail
- Source: `src/ui.tsx`
- Category: layout
- Description: Place scope, sort, filters, and the place list beside the map
- Extractable props: open (boolean, default false), scope (string, default "all")
- Hardcoded: lede copy, filter labels, scope labels

## MapChrome
- Source: `src/App.tsx` map-stage overlays plus `src/abroad/abroad.css` .map-mode
- Category: layout
- Description: Mode pill, legend, World/Filters actions floating on the map
- Extractable props: mode (string, default "travel"), panelOpen (boolean, default false), seasonLabel (string)
- Hardcoded: Travel, Study abroad, World, Fewer/More

## PlacePanel
- Source: `src/ui.tsx`
- Category: layout
- Description: Selected-place sheet over the right side of the map
- Extractable props: placeName (string)
- Hardcoded: section labels, close control

## Nav buttons and primary button
- Source: `src/styles.css` classes `.nav-btn`, `.primary`, `.map-actions button`
- Category: basic
- Skip extraction. Too small. Inline them in drafts.
