# Shared UI primitives

Framework: React 19 + Vite 6 + TypeScript. No component library (no Tailwind, shadcn, MUI). Styling is vanilla CSS in `src/styles.css` plus feature CSS files. Buttons, inputs, cards, tabs, and chips are class names, not components.

## Rating
- Path: `src/ui.tsx`
- Score chip. `none` is an em dash, not a red zero. Bands: great / good / ok / low / none.

```tsx
export function Rating({ value }: { value: number | null }) {
  if (value === null) return <span className="rate none" title="No reviews yet">—</span>;
  return <span className={`rate ${ratingBand(value)}`}>{value.toFixed(1)}</span>;
}
```

## Slider
- Path: `src/ui.tsx`
- Labeled range with a text value. Track fill uses `--pct`.

```tsx
function Slider({ label, value, min, max, step, display, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider">
      <span className="slider-top">
        <span>{label}</span>
        <span className="slider-value">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} aria-valuetext={display} style={{ ["--pct"]: `${pct}%` }} onChange={(event) => onChange(Math.round(Number(event.target.value) * 10) / 10)} />
    </label>
  );
}
```

## TravelLinks
- Path: `src/ui.tsx`
- Shown only after a place is on the itinerary. Two text links: Book travel, YiDeShare rides.

## Button classes (not components)
- `.primary` filled Yale blue, 36px, radius 8
- `.nav-btn` top nav, active gets a 2px primary underline
- `.map-actions button` 32px surface button with border
- `.icon-btn` 32px square, transparent
- `.textlink` inline primary text
- `.danger` inline #b42318
- `.choice-row button` 26px pill; `.on` fills primary
- `.seg button` segmented control inside a contrast track
- `.plus` 28px add control
- `.tab` / `.trips-tabs button` underline tabs

## FilterRail
- Path: `src/ui.tsx` lines 105–255
- Left rail on Map and Catalog. Scope tabs All / Countries / U.S., sort, filter drawer, place listbox. Full source is in `src/ui.tsx`.

## PlacePanel
- Path: `src/ui.tsx` starting line 257
- Right overlay on the map when a place is selected. Title, close, scores, stats, guide, friends, plan form, reviews.
