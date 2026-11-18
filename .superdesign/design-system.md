# TripTable design system

## Product

TripTable is a planning tool for Yale students. The home screen is a world map of where classmates are going for Spring Break, Summer, Fall Break, Winter, and Weekends. Counts are public. Names are private unless you are friends. The same shell also opens a catalog, Yale study-abroad programs, friends, an itinerary with flights and New Haven transit, and a profile.

The map is the product. Everything else hangs off a place you picked on that map.

## Voice

Plain, specific, short. Say "12 planning" not "12 Yalies are excited to explore". No marketing hero. No lorem ipsum.

## Visual direction

Keep the existing Yale blue. Do not introduce purple, indigo, or a new brand color. Light UI is the default; dark mode uses the dark tokens below.

The redesign should feel more appealing than the current screen without becoming a different brand. Make the world map the hero: full-bleed water and land, with chrome that sits quietly on top of it. Give the place sheet the care of a good travel brief — clear title, a calm score row, and the plan count as the one number that matters. Tighten alignment, use the existing 8px spacing scale with more air around the map controls, and keep type in the system font. No card-grid homepage, no gradient poster, no glassmorphism, no extra illustration in place of the geographic map.

Ocean is a pale blue so the map reads as water. Countries with no plans stay neutral gray. Heat runs from pale blue to Yale navy. Friend locations are the only amber marks. Score chips use green / amber / red with text, and an empty score is an em dash in tertiary text, never red.

## Tokens

See `.superdesign/init/theme.md` Part 1. Use those exact values.

- Font: system UI stack already in the app. Do not add a display serif or a novelty face.
- Radius: 8 for controls, 12 for the place sheet and dialogs, full pills only for the map mode switch, tags, and choice chips.
- Shadow: one soft shadow on the place sheet, the mode pill, and drawers. The map itself has no drop shadow.
- Focus: 2px primary outline, 2px offset. Every control is a button, link, or input.

## Map layout to preserve

Desktop, light theme, Travel mode, no place selected:

1. Top bar, 56px, surface, hairline bottom border.
2. Left rail, 332px: one-line explanation, All / Countries / U.S., count + sort, collapsed filters, scrolling place rows.
3. Map fills the remaining viewport. Mercator world, Antarctica omitted, home framed on the Atlantic.
4. Centered pill on the map: Travel (selected, filled primary) and Study abroad.
5. Bottom-left legend card: season and year, a short heat bar labeled Fewer → More, and the plan total.
6. Top-right: World. Filters is a phone control.

When a place is selected, a 420px sheet floats 12px from the top, right, and bottom. The map keeps its own zoom controls at the top left. The mode pill recenters in the map area that is not covered by the sheet.

## Components

- Top bar, filter rail, map chrome, and place sheet are the shared pieces. Their structure is in `.superdesign/init/extractable-components.md`.
- Place rows: name, score chip, "N planning · region". Selected row has a 3px primary inset bar.
- Do not add booking links until the place is on the itinerary.

## Motion

Map zoom is about 400ms. Respect `prefers-reduced-motion`. No decorative entrance animation.

## Do not

- Do not replace the geographic map with an illustration, a 3D globe, or a list pretending to be a map.
- Do not color countries by score. Color is plan volume.
- Do not show student names on the public map.
- Do not use purple, oversized radii, or stacked marketing cards.
