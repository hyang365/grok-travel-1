# Theme

## Part 1 — Token summary

CSS variables, not Tailwind. System UI font. Base 14px / 1.45.

### Color light
- text #141414
- text-secondary #3d3d3d
- text-tertiary #5c5c5c
- bg #f4f5f7
- surface #fff
- surface-contrast #f3f4f6
- surface-hover #f7f8fa
- border #e4e6ea
- border-control rgb(0 0 0 / 16%)
- track #c4c4c4
- primary #0c4a8a
- primary-hover #08366a
- on-primary #fff
- primary-subdued #0c4a8a1a
- primary-subdued-2 #0c4a8a0f
- shadow 0 1px 2px rgb(0 0 0 / 6%), 0 8px 20px rgb(0 0 0 / 6%)

### Color dark (`:root[data-theme="dark"]`)
- text #fafafa
- text-secondary #dbdbdb
- text-tertiary #c4c4c4
- bg #101114
- surface #1a1c21
- surface-contrast #24262c
- border #32343b
- primary #8ec2ff
- primary-hover #b7d7ff
- on-primary #08203f

### Map-only colors (amCharts, not tokens)
- ocean light #e8f1fb / dark #121820
- empty land light #f3f3f3 / dark #2a2a2a
- land stroke light #fff / dark #1a1a1a
- selected stroke light #141414 / dark #fff
- heat bar #d5e5fb → #0b3d91 (dark #1a3f73 → #c5ddff)
- place dot #163e78, selected dot #0b3d91
- friend dot #e39b12

### Score chips
- great #d9f5e3 / #0b7a32
- good #e5f6ea / #1b7a38
- ok #fff3d6 / #8d5b00
- low #fde8e6 / #b3261e
- none transparent / tertiary text
- Zero plans are never red.

### Type
- 11px meta, 12px labels and legend, 13px secondary, 14px body, 15px blurb, 18px brand and card titles, 22px panel titles (letter-spacing -0.03em)
- Weights 500, 600, 650, 700

### Space and radius
- Scale 4, 6, 8, 10, 12, 14, 16, 20, 24, 28
- Radius 6 controls inside segments, 8 inputs/buttons/cards, 12 panels and modals, 99 pills
- Top bar 56px. Rail 332px. Panel 420px, inset 12px. Focus ring 2px primary, offset 2px.

### Breakpoints
- 960px rail becomes a drawer
- 760px top bar wraps
- 520px map mode pills tighten

### Motion
- `prefers-reduced-motion: reduce` kills scroll animation
- Map zoom durations 400–450ms

## Part 2 — Raw CSS

### `src/styles.css`

```css
:root {
  --color-text: #141414;
  --color-text-secondary: #3d3d3d;
  --color-text-tertiary: #5c5c5c;
  --color-bg: #f4f5f7;
  --color-surface: #fff;
  --color-surface-contrast: #f3f4f6;
  --color-surface-hover: #f7f8fa;
  --color-border: #e4e6ea;
  --color-border-control: rgb(0 0 0 / 16%);
  --color-track: #c4c4c4;
  --color-primary: #0c4a8a;
  --color-primary-hover: #08366a;
  --color-on-primary: #fff;
  --color-primary-subdued: #0c4a8a1a;
  --color-primary-subdued-2: #0c4a8a0f;
  --shadow: 0 1px 2px rgb(0 0 0 / 6%), 0 8px 20px rgb(0 0 0 / 6%);
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
  line-height: 1.45;
  color: var(--color-text);
  background: var(--color-bg);
}

:root[data-theme="dark"] {
  --color-text: #fafafa;
  --color-text-secondary: #dbdbdb;
  --color-text-tertiary: #c4c4c4;
  --color-bg: #101114;
  --color-surface: #1a1c21;
  --color-surface-contrast: #24262c;
  --color-surface-hover: #ffffff0d;
  --color-border: #32343b;
  --color-border-control: rgb(255 255 255 / 18%);
  --color-track: #5a5a5a;
  --color-primary: #8ec2ff;
  --color-primary-hover: #b7d7ff;
  --color-on-primary: #08203f;
  --color-primary-subdued: #8ec2ff24;
  --color-primary-subdued-2: #8ec2ff14;
  --shadow: 0 1px 2px rgb(0 0 0 / 40%), 0 10px 24px rgb(0 0 0 / 35%);
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body { margin: 0; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
h2, h3, p { margin: 0; }
ul { margin: 0; padding: 0; list-style: none; }

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.topbar {
  height: 56px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.brand, .nav-btn, .filters-toggle, .map-actions button, .friend-detail .plan-actions button:not(.primary), .card .plan-actions button:not(.primary) {
  border: 0;
  background: transparent;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}
.brand-mark {
  width: 36px;
  height: 36px;
  display: block;
  object-fit: cover;
}
.brand-name {
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.03em;
}

.search {
  flex: 1;
  min-width: 0;
  max-width: 460px;
  height: 36px;
  border: 1px solid var(--color-border-control);
  border-radius: 8px;
  padding: 0 12px;
  background: var(--color-surface-contrast);
}
.search:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.season, select, .plan select, .add-friend input, .plan input, .plan textarea {
  height: 34px;
  border: 1px solid var(--color-border-control);
  border-radius: 8px;
  background: var(--color-surface);
  padding: 0 8px;
}
.season { max-width: 150px; }
.plan textarea {
  height: auto;
  width: 100%;
  padding: 8px;
  resize: vertical;
}

.nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-btn, .filters-toggle {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
}
.nav-btn:hover, .filters-toggle:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}
.nav-btn.active {
  color: var(--color-text);
  font-weight: 650;
  border-bottom-color: var(--color-primary);
  border-radius: 8px 8px 0 0;
}
.badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 11px;
  font-weight: 700;
  display: inline-grid;
  place-items: center;
}
.filters-toggle { display: none; }

.workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 332px 1fr;
}

.rail {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg);
}
.rail-head, .filters { padding: 12px 12px 0; }
.lede { color: var(--color-text-secondary); font-size: 13px; }
.feature {
  margin-top: 8px;
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-border);
  background: var(--color-primary-subdued-2);
  color: var(--color-text);
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
}
.feature:hover { background: var(--color-primary-subdued); }
.seg {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 10px;
  padding: 3px;
  border-radius: 8px;
  background: var(--color-surface-contrast);
}
.seg button {
  border: 0;
  background: transparent;
  height: 28px;
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
  white-space: nowrap;
}
.seg button.active { background: var(--color-surface); color: var(--color-text); font-weight: 650; }
.sort-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  color: var(--color-text-tertiary);
  font-size: 12px;
}
.sort-row select { height: 28px; font-size: 12px; }

.filters { display: flex; flex-direction: column; gap: 8px; padding-bottom: 8px; }
.slider { display: flex; flex-direction: column; gap: 4px; }
.slider-top, .stay-top, .card-top, .panel-head, .friend-detail header, .itinerary > header, .plan-actions, .date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.slider-value, .fine, .kicker, .row-meta, .row-scores, .stay-meta, .legend, .eval footer {
  color: var(--color-text-tertiary);
  font-size: 12px;
}
.kicker { text-transform: uppercase; letter-spacing: 0.04em; font-weight: 650; }
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  margin: 7px 0;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-primary) var(--pct, 0%), var(--color-track) var(--pct, 0%));
  cursor: pointer;
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-primary) var(--pct, 0%), var(--color-track) var(--pct, 0%));
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -6px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
}
input[type="range"]::-moz-range-track {
  height: 4px;
  border: 0;
  border-radius: 99px;
  background: var(--color-track);
}
input[type="range"]::-moz-range-progress {
  height: 4px;
  border-radius: 99px;
  background: var(--color-primary);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-surface);
}
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.textlink, .danger {
  border: 0;
  background: transparent;
  color: var(--color-primary);
  padding: 0;
  width: fit-content;
}
.textlink:disabled { color: var(--color-text-tertiary); cursor: default; }
.danger { color: #b42318; }
.fine { margin-top: 4px; }
.field-label { font-size: 12px; color: var(--color-text-secondary); }
.choice-row { display: flex; flex-wrap: wrap; gap: 6px; }
.choice-row button {
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 99px;
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.choice-row button.on { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }
.travel-links { display: flex; gap: 12px; }
.travel-links a { color: var(--color-primary); font-weight: 650; }
.guidance { border-radius: 8px; padding: 8px 10px; font-size: 13px; }
.guidance.ok { background: var(--color-primary-subdued-2); }
.guidance.regional { background: #fff3d6; color: #6b4a00; }
.guidance.blocked { background: #fde8e6; color: #7a1c16; }
:root[data-theme="dark"] .guidance.regional { background: #3a2e12; color: #ffd78a; }
:root[data-theme="dark"] .guidance.blocked { background: #3a1714; color: #ffb4ab; }
.catalog { position: absolute; inset: 0; overflow: auto; background: var(--color-bg); }
.catalog-stage.panel-open .catalog { right: 444px; }
.catalog-table { width: 100%; border-collapse: collapse; }
.catalog-table th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  text-align: left;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 650;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  z-index: 1;
}
.catalog-table th:first-child,
.catalog-table td:first-child {
  position: sticky;
  left: 0;
  background: var(--color-surface);
  z-index: 1;
}
.catalog-table th:first-child { z-index: 2; }
.sort-head {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 650;
  padding: 0;
  cursor: pointer;
}
.sort-head.active { color: var(--color-text); }
.catalog-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.catalog-table td.num { padding: 0; width: 88px; }
.catalog-table td strong { display: block; }
.place-open {
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.catalog-table tbody tr { cursor: pointer; }
.catalog-table tbody tr:hover { background: var(--color-surface-hover); }
.catalog-table tbody tr:hover td:first-child { background: var(--color-surface-hover); }
.catalog-table tbody tr.active { background: var(--color-primary-subdued-2); box-shadow: inset 3px 0 0 var(--color-primary); }
.catalog-table tbody tr.active td:first-child { background: var(--color-primary-subdued-2); }
.catalog-table tbody tr:focus-visible { outline: 2px solid var(--color-primary); outline-offset: -2px; }
.plus {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  font-size: 18px;
  line-height: 1;
}
.plus:hover { background: var(--color-primary-subdued); }
.modal-back {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgb(0 0 0 / 32%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal {
  width: min(440px, 100%);
  max-height: min(640px, 100%);
  overflow: auto;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
}

.list { flex: 1; overflow: auto; border-top: 1px solid var(--color-border); }
.row {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  padding: 9px 12px;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  text-align: left;
}
.row:hover { background: var(--color-surface-hover); }
.row.active { background: var(--color-primary-subdued-2); box-shadow: inset 3px 0 0 var(--color-primary); }
.row-name { font-weight: 650; }
.row-scores { grid-column: 1 / -1; }

.rate {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 26px;
  padding: 0 6px;
  border-radius: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
}
.catalog-table td.num .rate {
  display: flex;
  width: 100%;
  min-height: 34px;
  box-sizing: border-box;
}
.rate.great { background: #d9f5e3; color: #0b7a32; }
.rate.good { background: #e5f6ea; color: #1b7a38; }
.rate.ok { background: #fff3d6; color: #8d5b00; }
.rate.low { background: #fde8e6; color: #b3261e; }
.rate.none { background: transparent; color: var(--color-text-tertiary); font-weight: 500; }
:root[data-theme="dark"] .rate.great { background: #123322; color: #8ee2ad; }
:root[data-theme="dark"] .rate.good { background: #163524; color: #b7ebc6; }
:root[data-theme="dark"] .rate.ok { background: #3a2e12; color: #ffd78a; }
:root[data-theme="dark"] .rate.low { background: #3a1714; color: #ffb4ab; }

.map-stage { position: relative; min-width: 0; min-height: 0; }
.map { position: absolute; inset: 0; }
.legend, .map-actions { position: absolute; z-index: 2; }
.legend {
  left: 12px;
  bottom: 46px;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 10px;
}
.legend-title { color: var(--color-text); font-weight: 650; font-size: 12px; }
.legend-scale { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.legend-bar {
  width: 88px;
  height: 8px;
  border-radius: 99px;
  background: linear-gradient(90deg, #d5e5fb, #0b3d91);
}
:root[data-theme="dark"] .legend-bar { background: linear-gradient(90deg, #1a3f73, #c5ddff); }
.map-actions { top: 12px; right: 12px; }
.map-actions button, .friend-detail .plan-actions button:not(.primary), .card .plan-actions button:not(.primary) {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
.primary {
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 650;
}
.primary:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }
.primary:disabled { opacity: 0.5; }
.map-stage.panel-open .map-actions { right: 444px; }

.panel {
  position: absolute;
  top: 12px;
  right: 12px;
  bottom: 12px;
  width: min(420px, calc(100% - 24px));
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  z-index: 3;
  overflow: hidden;
}
.panel-scroll { height: 100%; overflow: auto; padding: 14px 14px 24px; display: flex; flex-direction: column; gap: 10px; }
.panel h2, .itinerary h2, .friend-detail h2, .friend-col h2 { font-size: 22px; letter-spacing: -0.03em; }
.icon-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 22px;
  line-height: 1;
}
.icon-btn:hover { background: var(--color-surface-contrast); }
.blurb { font-size: 15px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  border: 1px solid var(--color-border);
  border-radius: 99px;
  padding: 2px 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}
.atlas-tag { background: var(--color-primary-subdued); color: var(--color-text); border-color: transparent; }
.scoregrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.scoregrid div { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; font-size: 11px; color: var(--color-text-tertiary); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stats div, .card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats b, .bar-n, .overlap-line b { font-variant-numeric: tabular-nums; }
.stats b { font-size: 18px; }
.stats span, .stats small { color: var(--color-text-tertiary); font-size: 11px; }
.callout, .atlas {
  background: var(--color-primary-subdued-2);
  border-radius: 8px;
  padding: 8px 10px;
}
.guide { color: var(--color-text-secondary); }
.friend-hits li, .inside button, .trip-list li, .suggest button {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  text-align: left;
}
.friend-hits li { font-size: 13px; padding: 4px 0; border-bottom: 1px solid var(--color-border); }
.inside-wrap h3, .friend-detail h3 { font-size: 13px; margin-bottom: 6px; }
.inside button, .suggest button, .friend-list button, .trip-list li {
  border: 0;
  background: transparent;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}
.inside button span:nth-child(2), .suggest span, .friend-list span, .trip-list span { color: var(--color-text-tertiary); font-size: 12px; }
.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--color-border); }
.tab {
  border: 0;
  background: transparent;
  padding: 8px 8px 6px;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
}
.tab.active { color: var(--color-text); border-bottom-color: var(--color-primary); font-weight: 700; }
.eval, .stays li {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  background: var(--color-surface-contrast);
}
.eval header, .stay-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.eval p, .stays p, .card p { margin-top: 4px; }
.stack, .stays, .history { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: grid; grid-template-columns: 72px 1fr 48px; gap: 8px; align-items: center; font-size: 12px; }
.bar { height: 8px; background: var(--color-surface-contrast); border-radius: 99px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--color-primary); }
.plan, .friend-col, .friend-detail, .itinerary { display: flex; flex-direction: column; gap: 10px; }
.plan label, .date-row label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
.plan select, .plan input, .date-row input { width: 100%; }
.date-row { align-items: end; }
fieldset { border: 1px solid var(--color-border); border-radius: 8px; padding: 8px; }
legend { padding: 0 4px; font-size: 12px; }
.form-error { color: #b42318; font-size: 12px; }
.plan-actions { justify-content: flex-start; }

.friends-page {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px 1fr;
}
.friend-col, .friend-detail { min-height: 0; overflow: auto; padding: 20px; }
.friend-col { border-right: 1px solid var(--color-border); }
.add-friend { display: flex; gap: 8px; }
.add-friend input { flex: 1; }
.friend-list button.active { background: var(--color-primary-subdued-2); }
.friend-list button, .suggest button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  border-radius: 8px;
  padding: 8px;
}
.trip-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chips button {
  border: 1px solid var(--color-border);
  background: transparent;
  border-radius: 99px;
  height: 28px;
  padding: 0 10px;
}
.trip-list li { align-items: flex-start; padding: 12px 0; gap: 12px; }
.itinerary { flex: 1; overflow: auto; max-width: 860px; width: 100%; margin: 0 auto; padding: 28px 20px 48px; }
.cards { display: flex; flex-direction: column; gap: 12px; }
.card h3 { font-size: 18px; }
.empty { color: var(--color-text-secondary); padding: 12px; }

.toast {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #141414;
  color: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 6;
  font-size: 13px;
}
:root[data-theme="dark"] .toast { background: #fafafa; color: #141414; }

.crash {
  min-height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 24px;
}

@media (max-width: 960px) {
  .filters-toggle { display: inline-flex; }
  .brand-name { display: none; }
  .workspace { grid-template-columns: 1fr; }
  .rail { display: none; }
  .rail.open {
    display: flex;
    position: absolute;
    z-index: 4;
    inset: 56px auto 0 0;
    width: min(360px, 100%);
    box-shadow: var(--shadow);
    background: var(--color-surface);
  }
  .friends-page { grid-template-columns: 1fr; }
  .map-stage.panel-open .map-actions { right: 12px; top: auto; bottom: 72px; }
  .stats { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; }
}

.theme-btn { width: 34px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; color: var(--color-text-secondary); }
.theme-btn:hover { background: var(--color-surface-hover); color: var(--color-text); }

/* Phones: two-row top bar so the search box and menus don't get squeezed. */
@media (max-width: 760px) {
  .topbar { height: auto; flex-wrap: wrap; row-gap: 6px; padding: 8px 10px 6px; }
  .topbar .search { order: 1; flex: 1 1 0; max-width: none; }
  .topbar .season-wrap { order: 2; }
  .topbar .pf-menu { order: 3; }
  .topbar .nav { order: 4; flex: 1 0 100%; margin-left: 0; }
  .season { max-width: 140px; }
  .rail.open { inset: 96px auto 0 0; }
}

/* Itinerary: Trips / Flights / Buses & trains */
.topbar-spacer { flex: 1; }
.trips-shell { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.trips-shell > :not(.trips-tabs) { flex: 1; min-height: 0; }
.trips-tabs { display: flex; justify-content: center; gap: 4px; padding: 0 16px; border-bottom: 1px solid var(--color-border); background: var(--color-surface); flex: none; overflow-x: auto; }
.trips-tabs button { border: 0; background: transparent; padding: 12px 14px 10px; color: var(--color-text-secondary); font-weight: 600; border-bottom: 2px solid transparent; white-space: nowrap; }
.trips-tabs button:hover { color: var(--color-text); }
.trips-tabs button.active { color: var(--color-text); border-bottom-color: var(--color-primary); }

.filters-drawer { border-bottom: 1px solid var(--color-border); }
.filters-drawer > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 10px 12px; font-weight: 600; font-size: 13px; }
.filters-drawer > summary::-webkit-details-marker { display: none; }
.filters-drawer > summary::after { content: "▾"; margin-left: auto; color: var(--color-text-tertiary); transition: transform 0.15s; }
.filters-drawer[open] > summary::after { transform: rotate(180deg); }
.filters-drawer .filters { padding-top: 0; padding-bottom: 12px; }

.nav-short { display: none; }
.map-actions { display: flex; gap: 6px; }
.catalog-actions { display: none; }
.empty-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin: 16px; padding: 16px; border: 1px dashed var(--color-border); border-radius: 8px; background: var(--color-surface); color: var(--color-text-secondary); }
.empty-card h2 { font-size: 16px; color: var(--color-text); letter-spacing: -0.02em; }
.list .empty-card { margin: 12px; }
@media (max-width: 960px) {
  .catalog-actions { display: flex; position: absolute; top: 8px; right: 12px; z-index: 3; }
}
@media (max-width: 760px) {
  .nav-long { display: none; }
  .nav-short { display: inline; }
  .topbar .nav { justify-content: space-between; gap: 0; }
  .topbar .nav-btn { padding: 0 8px; font-size: 13px; }
}
@media (max-width: 760px) {
  .map-stage > .map-actions:not(.catalog-actions) { top: 58px; }
  .map-mode { left: 56px; transform: none; }
  .map-stage.panel-open .map-mode { left: 56px; }
}

/* Accounts and real friends */
.auth-banner { position: fixed; left: 50%; top: 64px; transform: translateX(-50%); z-index: 60; display: flex; gap: 12px; align-items: center; max-width: min(560px, calc(100vw - 24px)); padding: 10px 14px; border-radius: 10px; background: #fef3f2; color: #912018; border: 1px solid #fecdca; font-size: 13px; box-shadow: 0 6px 20px rgba(0,0,0,.12); }
.friends-page.guest { display: block; max-width: 560px; margin: 32px auto; width: 100%; }
.friends-page.guest .friend-col { border-right: 0; }
.req-block { display: grid; gap: 6px; margin-top: 4px; }
.req-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 8px; background: var(--color-bg-secondary, rgba(127,127,127,.08)); }
.req-row > span:first-child { display: grid; min-width: 0; }
.req-row small { color: var(--color-text-tertiary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
.req-actions { display: flex; gap: 6px; align-items: center; }
.ok-line { color: #067647; }
.friend-detail header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }

```

### `src/profile/profile.css`

```css
.pf-menu { position: relative; flex: none; }
.pf-avatar { width: 32px; height: 32px; border-radius: 50%; border: 0; background: var(--color-primary); color: var(--color-on-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.02em; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.pf-avatar.active, .pf-avatar:hover { box-shadow: 0 0 0 3px var(--color-primary-subdued); }
.pf-avatar.big { width: 40px; height: 40px; font-size: 14px; }
.pf-avatar.xl { width: 56px; height: 56px; font-size: 18px; }
.pf-drop { position: absolute; right: 0; top: calc(100% + 6px); z-index: 40; width: 260px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: var(--shadow); padding: 6px; display: flex; flex-direction: column; }
.pf-who { display: flex; gap: 10px; align-items: center; padding: 8px 8px 10px; border-bottom: 1px solid var(--color-border); margin-bottom: 4px; }
.pf-who div { display: flex; flex-direction: column; min-width: 0; }
.pf-who span:not(.pf-avatar) { font-size: 12px; color: var(--color-text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pf-drop > button, .pf-drop > a { display: flex; justify-content: space-between; align-items: center; height: 34px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: var(--color-text); text-decoration: none; font-size: 14px; text-align: left; }
.pf-drop > button:hover, .pf-drop > a:hover { background: var(--color-surface-hover); }
.pf-drop small { color: var(--color-text-tertiary); font-size: 12px; }
.pf-drop hr { border: 0; border-top: 1px solid var(--color-border); margin: 4px 0; }

.pf-star { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border-radius: 99px; border: 1px solid var(--color-border-control); background: var(--color-surface); color: var(--color-text-secondary); font-size: 12px; width: fit-content; }
.pf-star.on { color: #b54708; border-color: #f5c66b; background: #fff8e6; }
:root[data-theme="dark"] .pf-star.on { background: #3a2a0a; border-color: #7a5a14; color: #ffd27a; }

.pf-page { flex: 1; overflow: auto; width: 100%; max-width: 900px; margin: 0 auto; padding: 28px 20px 56px; display: flex; flex-direction: column; gap: 16px; }
.pf-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.pf-head h2 { font-size: 22px; }
.pf-stats { display: flex; gap: 8px; margin: 0 0 0 auto; }
.pf-stats div { border: 1px solid var(--color-border); border-radius: 10px; padding: 6px 12px; text-align: center; min-width: 72px; }
.pf-stats dt { font-size: 11px; color: var(--color-text-tertiary); }
.pf-stats dd { margin: 0; font-size: 18px; font-weight: 700; }
.pf-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--color-border); overflow-x: auto; }
.pf-section { display: flex; flex-direction: column; gap: 12px; }
.pf-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pf-list { display: flex; flex-direction: column; gap: 8px; }
.pf-list li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: 10px; flex-wrap: wrap; }
.pf-list li > div:first-child, .pf-list li label span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pf-list li.done strong { text-decoration: line-through; color: var(--color-text-tertiary); }
.pf-list .plan-actions button:not(.primary):not(.textlink) { height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); }
.pf-body { font-size: 13px; color: var(--color-text-secondary); }
.pf-form { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--color-border); border-radius: 12px; }
.pf-form label, .pf-dates label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
.pf-form input, .pf-dates input, .pf-dates select, .pf-place input { height: 34px; border: 1px solid var(--color-border-control); border-radius: 8px; background: var(--color-surface); padding: 0 10px; }
.pf-place { position: relative; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
.pf-dates { display: flex; gap: 10px; flex-wrap: wrap; }
.pf-dates label { flex: 1; min-width: 140px; }
.pf-settings { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.pf-card { border: 1px solid var(--color-border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.pf-card h3 { font-size: 15px; }
.pf-link { display: inline-flex; align-items: center; text-decoration: none; }
@media (max-width: 640px) {
  .pf-stats { margin: 0; width: 100%; }
  .pf-stats div { flex: 1; min-width: 0; padding: 6px; }
}
.pf-legal { display: flex; gap: 6px; padding: 8px 10px 4px; font-size: 12px; color: var(--color-text-tertiary); }
.pf-legal a { color: var(--color-text-tertiary); text-decoration: none; }
.pf-legal a:hover { text-decoration: underline; }
.pf-avatar .pf-guest { font-size: 12px; font-weight: 600; }
.pf-menu > .pf-avatar:has(.pf-guest) { width: auto; padding: 0 12px; border-radius: 999px; }
.pf-drop .pf-signin { background: var(--color-primary); color: var(--color-on-primary); border-radius: 8px; margin: 4px 0; justify-content: center; }
.pf-name { display: grid; gap: 4px; margin-bottom: 8px; font-size: 13px; }
.pf-name input { padding: 8px 10px; border-radius: 8px; border: 1px solid var(--color-border, #d0d5dd); background: transparent; color: inherit; font: inherit; }

```

### `src/reviews/reviews.css`

```css
.rv { display: flex; flex-direction: column; gap: 10px; }
.rv-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rv-scores > div { border: 1px solid var(--color-border); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; }
.rv-score { font-weight: 650; font-size: 16px; }
.rv-score.none { color: var(--color-text-tertiary); font-weight: 400; }
.rv-skeleton { display: flex; flex-direction: column; gap: 8px; }
.rv-skeleton div { height: 48px; border-radius: 8px; background: var(--color-surface-contrast); animation: rv-pulse 1.2s ease-in-out infinite; }
.rv-skeleton div:nth-child(2) { animation-delay: 0.15s; }
.rv-skeleton div:nth-child(3) { width: 72%; animation-delay: 0.3s; }
@keyframes rv-pulse { 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .rv-skeleton div { animation: none; } }
.rv-list { display: flex; flex-direction: column; gap: 8px; }
.rv-list li { border: 1px solid var(--color-border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
.rv-top { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; }
.rv-actions { display: flex; gap: 10px; }
.rv-write { width: fit-content; }
.rv-form, .rv-signin { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; }
.rv-signin { flex-direction: column; align-items: stretch; }
.rv-signin input { flex: 1; min-width: 180px; }
.rv-signin p { flex-basis: 100%; }
.rv-signin.compact { border: 0; padding: 0; }
.rv-row { display: flex; flex-wrap: wrap; gap: 8px; }
.rv-form label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--color-text-secondary); }
.rv-form select, .rv-form textarea, .rv-signin input {
  border: 1px solid var(--color-border-control);
  border-radius: 8px;
  background: var(--color-surface);
  height: 32px;
  padding: 0 6px;
}
.rv-form textarea { height: auto; padding: 8px; resize: vertical; width: 100%; }
@media (max-width: 520px) { .rv-scores { grid-template-columns: repeat(2, 1fr); } }
.rv-signin { flex-direction: column; align-items: stretch; }
.rv-google { display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--color-border-control); background: var(--color-surface); color: var(--color-text); font-weight: 600; }
.rv-google:hover { background: var(--color-surface-hover); }
.rv-emailalt summary { cursor: pointer; font-size: 12px; color: var(--color-text-secondary); }
.rv-emailalt form { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.rv-emailalt input { flex: 1; min-width: 180px; height: 32px; border: 1px solid var(--color-border-control); border-radius: 8px; background: var(--color-surface); padding: 0 8px; }

```

### `src/flights/flights.css`

```css
/* Flights tab: uses TripTable's own color variables, so light and dark themes both work. */

.fl-page { flex: 1; overflow: auto; width: 100%; max-width: 1240px; margin: 0 auto; padding: 24px 20px 56px; display: flex; flex-direction: column; gap: 14px; }
.fl-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.fl-head h2 { font-size: 22px; letter-spacing: -0.03em; }
.fl-muted { color: var(--color-text-tertiary); }
.fl-small { font-size: 12px; }
.fl-pad { padding: 8px 10px; }
.fl-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Avelo switch (top bar + page header) */
.fl-avelo { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 13px; font-weight: 600; cursor: pointer; user-select: none; white-space: nowrap; }
.fl-avelo input { position: absolute; opacity: 0; width: 0; height: 0; }
.fl-switch { position: relative; width: 28px; height: 16px; border-radius: 99px; background: var(--color-track); transition: background 0.15s; flex: none; }
.fl-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #fff; transition: transform 0.15s; }
.fl-avelo.on { border-color: #f3b8b2; background: #fde8e6; color: #b42318; }
.fl-avelo.on .fl-switch { background: #d92d20; }
.fl-avelo.on .fl-switch::after { transform: translateX(12px); }
.fl-avelo:focus-within { outline: 2px solid var(--color-primary); outline-offset: 2px; }
:root[data-theme="dark"] .fl-avelo.on { background: #3a1714; border-color: #7a271a; color: #ffb4ab; }

.fl-find { width: 100%; height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }

/* Search bar */
.fl-search { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); }
.fl-field { display: flex; flex-direction: column; gap: 4px; position: relative; }
.fl-field input { height: 36px; border: 1px solid var(--color-border-control); border-radius: 8px; background: var(--color-surface); padding: 0 10px; }
.fl-field input:focus { outline: none; border-color: var(--color-primary); }
.fl-dest { flex: 1; min-width: 240px; }
.fl-drop { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; box-shadow: var(--shadow); padding: 4px; max-height: 320px; overflow: auto; }
.fl-drop button { width: 100%; display: flex; justify-content: space-between; gap: 10px; padding: 8px 10px; border: 0; border-radius: 6px; background: transparent; text-align: left; }
.fl-drop button:hover { background: var(--color-primary-subdued-2); }
.fl-breaks { display: flex; flex-wrap: wrap; gap: 6px; }
.fl-breaks button, .fl-chip { height: 30px; padding: 0 10px; border-radius: 99px; border: 1px solid var(--color-border-control); background: var(--color-surface); font-size: 12px; }
.fl-breaks button:hover, .fl-chip:hover { background: var(--color-surface-hover); }
.fl-breaks button.on, .fl-chip.on { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }

/* Toolbar + filters */
.fl-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.seg.fl-seg { margin: 0; grid-template-columns: repeat(4, auto); }
.seg.fl-seg button { padding: 0 12px; }
.fl-crew { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fl-ghost { height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); white-space: nowrap; }
.fl-ghost:hover, .fl-ghost.on { background: var(--color-surface-contrast); }
.fl-toolbar > .fl-ghost { margin-left: auto; }
.fl-filters { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 12px; background: var(--color-surface-contrast); }
.fl-frow { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.fl-frow > .field-label { min-width: 120px; }
.fl-frow input[type="range"] { width: 160px; accent-color: var(--color-primary); }

/* Layout */
.fl-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
.fl-results { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.fl-side { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 0; }
.fl-summary { color: var(--color-text-secondary); }
.fl-empty { padding: 32px; text-align: center; color: var(--color-text-tertiary); border: 1px dashed var(--color-border-control); border-radius: 12px; }
.fl-blocked { font-size: 14px; padding: 14px 16px; }
.fl-overlap { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 10px; background: var(--color-primary-subdued-2); font-size: 13px; }
.fl-overlap .textlink { margin-left: 8px; }
.fl-hidden { font-size: 13px; color: #b42318; padding: 8px 12px; border-radius: 8px; background: #fde8e6; }
:root[data-theme="dark"] .fl-hidden { background: #3a1714; color: #ffb4ab; }

/* Result cards */
.fl-list { display: flex; flex-direction: column; gap: 10px; }
.fl-opt { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; padding: 14px 16px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); }
.fl-opt:hover { box-shadow: var(--shadow); }
.fl-opt.top { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary-subdued); }
.fl-opt-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fl-dot { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.fl-badge { font-size: 11px; font-weight: 650; padding: 2px 8px; border-radius: 99px; }
.b-best { background: var(--color-primary-subdued); color: var(--color-text); }
.b-cheapest { background: #d9f5e3; color: #0b7a32; }
.b-fastest { background: #fff3d6; color: #8d5b00; }
.b-greenest { background: #e5f6ea; color: #1b7a38; }
.fl-legs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.fl-leg { font-size: 12px; padding: 3px 8px; border-radius: 6px; background: var(--color-surface-contrast); color: var(--color-text-secondary); }
.fl-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 12px; color: var(--color-text-tertiary); }
.fl-meta b { color: var(--color-text); font-weight: 600; }
.fl-opt-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px; text-align: right; }
.fl-price { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.fl-actions { display: flex; gap: 6px; align-items: center; }
.fl-book { display: inline-flex; align-items: center; text-decoration: none; }
.fl-more { align-self: center; height: 34px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); }

/* Side cards */
.fl-card { padding: 14px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); display: flex; flex-direction: column; gap: 8px; }
.fl-card h3 { font-size: 15px; }
.fl-status { align-self: flex-start; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 99px; }
.s-now { background: #fde8e6; color: #b3261e; }
.s-good { background: #d9f5e3; color: #0b7a32; }
.s-wait, .s-past { background: #fff3d6; color: #8d5b00; }
.fl-headline { font-weight: 600; }
.fl-spark { width: 100%; height: 90px; }
.fl-kv { margin: 0; display: flex; flex-direction: column; }
.fl-kv div { display: flex; justify-content: space-between; gap: 8px; padding: 6px 0; border-top: 1px solid var(--color-border); font-size: 13px; }
.fl-kv dt { color: var(--color-text-secondary); }
.fl-kv dd { margin: 0; font-weight: 600; text-align: right; }
.fl-cal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.fl-cal button { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); font-size: 11px; color: var(--color-text-secondary); }
.fl-cal button b { font-size: 12px; color: var(--color-text); font-variant-numeric: tabular-nums; }
.fl-cal button.lo { background: #e5f6ea; }
.fl-cal button.lo b { color: #0b7a32; }
.fl-cal button.hi b { color: #b3261e; }
.fl-cal button.sel { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }
:root[data-theme="dark"] .fl-cal button.lo { background: #12301d; }
:root[data-theme="dark"] .fl-cal button.lo b { color: #7ddc9c; }
.fl-airports { width: 100%; border-collapse: collapse; font-size: 13px; }
.fl-airports td { padding: 7px 4px; border-top: 1px solid var(--color-border); }
.fl-airports tr { cursor: pointer; }
.fl-airports tr:hover { background: var(--color-surface-hover); }
.fl-airports tr.best td:first-child b { color: var(--color-primary); }
.fl-airports tr.best .fl-num:first-of-type { font-weight: 700; }
.fl-saved { display: flex; flex-direction: column; }
.fl-saved li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid var(--color-border); font-size: 13px; }

@media (max-width: 960px) {
  .fl-grid { grid-template-columns: 1fr; }
  .fl-side { position: static; }
}
@media (max-width: 640px) {
  .fl-opt { grid-template-columns: 1fr; }
  .fl-opt-side { align-items: flex-start; text-align: left; }
  .fl-avelo-text { display: none; }
  .fl-toolbar > .fl-ghost { margin-left: 0; }
}
@media (max-width: 760px) {
  /* The top bar gains a Flights tab and the Avelo switch; let the menu scroll sideways on phones. */
  .topbar { overflow: hidden; }
  .topbar .nav { min-width: 0; overflow-x: auto; scrollbar-width: none; flex-shrink: 1; }
  .topbar .nav::-webkit-scrollbar { display: none; }
  .topbar .nav > * { flex: none; }
}

/* Link-out planner */
.fl-allairports { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--color-primary); border-radius: 12px; background: var(--color-primary-subdued-2); flex-wrap: wrap; }
.fl-opt-side .fl-book, .fl-allairports .fl-book, .fl-card .fl-book { justify-content: center; white-space: nowrap; }
.fl-meta a { color: var(--color-primary); text-decoration: none; }
.fl-ground { display: flex; flex-direction: column; }
.fl-ground li { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 8px 0; border-top: 1px solid var(--color-border); font-size: 13px; }
.fl-actions a.textlink { text-decoration: none; font-size: 12px; }
.fl-chip:disabled { opacity: 0.45; text-decoration: line-through; cursor: default; }
.fl-group { border-color: var(--color-primary); }
.fl-legcard { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-radius: 8px; background: var(--color-surface-contrast); }
.fl-legcard > div:first-child { display: flex; flex-direction: column; }
.fl-legform { display: flex; flex-direction: column; gap: 6px; }
.fl-legrow { display: flex; gap: 6px; }
.fl-legrow label { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--color-text-secondary); flex: 1; min-width: 0; }
.fl-legrow input, .fl-group .fl-field input { height: 32px; border: 1px solid var(--color-border-control); border-radius: 8px; background: var(--color-surface); padding: 0 8px; width: 100%; min-width: 0; }
.fl-booked { display: flex; flex-direction: column; gap: 4px; }
.fl-ok { color: #0b7a32; font-weight: 600; font-size: 13px; }
.fl-tips { display: flex; flex-direction: column; gap: 6px; padding-left: 16px; list-style: disc; font-size: 13px; color: var(--color-text-secondary); }
.fl-gsum { font-size: 13px; padding: 6px 10px; border-radius: 8px; background: #fff3d6; color: #8d5b00; }
.fl-gsum.ok { background: #d9f5e3; color: #0b7a32; }
:root[data-theme="dark"] .fl-gsum { background: #3a2a0a; color: #ffd27a; }
:root[data-theme="dark"] .fl-gsum.ok { background: #12301d; color: #7ddc9c; }
.fl-crewpick { position: relative; }
.fl-crewmenu { position: absolute; top: calc(100% + 4px); left: 0; z-index: 30; min-width: 260px; max-height: 320px; overflow: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; box-shadow: var(--shadow); padding: 8px; display: flex; flex-direction: column; gap: 2px; }
.fl-crewitem { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; padding: 6px 6px; border-radius: 6px; cursor: pointer; }
.fl-crewitem:hover { background: var(--color-surface-hover); }
.fl-crewfoot { display: flex; justify-content: space-between; padding: 6px 6px 0; border-top: 1px solid var(--color-border); margin-top: 4px; }

```

### `src/transit/transit.css`

```css
.tr-page { flex: 1; overflow: auto; width: 100%; max-width: 1240px; margin: 0 auto; padding: 24px 20px 56px; display: flex; flex-direction: column; gap: 14px; }
.tr-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.tr-top h2 { font-size: 22px; letter-spacing: -0.03em; }
.tr-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.tr-col { display: flex; flex-direction: column; gap: 14px; }
.tr-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.tr-pill { font-size: 11px; font-weight: 650; padding: 3px 9px; border-radius: 99px; background: var(--color-surface-contrast); color: var(--color-text-secondary); white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
.tr-pill.live { background: #d9f5e3; color: #0b7a32; }
.tr-pill.live i { width: 7px; height: 7px; border-radius: 50%; background: #12b76a; animation: tr-pulse 1.6s infinite; }
.tr-pill.off { background: #fde8e6; color: #b42318; }
:root[data-theme="dark"] .tr-pill.live { background: #12301d; color: #7ddc9c; }
:root[data-theme="dark"] .tr-pill.off { background: #3a1714; color: #ffb4ab; }
@keyframes tr-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@media (prefers-reduced-motion: reduce) { .tr-pill.live i { animation: none; } }
.tr-map { height: 340px; border-radius: 10px; overflow: hidden; border: 1px solid var(--color-border); z-index: 0; }
.tr-bus span { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 20px; padding: 0 5px; border-radius: 6px; color: #fff; font: 700 11px/1 -apple-system, sans-serif; border: 1.5px solid #fff; box-shadow: 0 1px 4px rgb(0 0 0 / 35%); }
.tr-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.tr-row select { height: 30px; border: 1px solid var(--color-border-control); border-radius: 8px; background: var(--color-surface); max-width: 60%; }
.tr-stops { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.tr-stop { border: 1px solid var(--color-border); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.tr-stop ul { display: flex; flex-direction: column; gap: 4px; }
.tr-stop li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; align-items: center; }
.tr-route { min-width: 32px; text-align: center; padding: 1px 6px; border-radius: 6px; background: #d92d20; color: #fff; font-weight: 700; font-size: 12px; }
.tr-what { display: flex; flex-direction: column; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tr-what small, .tr-when small { color: var(--color-text-tertiary); font-size: 11px; }
.tr-board { display: flex; flex-direction: column; }
.tr-board li { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 8px 0; border-top: 1px solid var(--color-border); font-size: 13px; }
.tr-when { display: flex; flex-direction: column; }
.tr-ok { color: #0b7a32; font-size: 12px; font-weight: 600; }
.tr-late { color: #b42318; font-size: 12px; font-weight: 600; }
.tr-fallback { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--color-text-secondary); padding: 10px; border-radius: 8px; background: var(--color-surface-contrast); }
.tr-links { display: flex; flex-wrap: wrap; gap: 12px; }
.tr-links a { color: var(--color-primary); text-decoration: none; font-size: 13px; }
.tr-mini .tr-board li { grid-template-columns: 56px minmax(0, 1fr) auto; }
@media (max-width: 960px) { .tr-grid { grid-template-columns: 1fr; } }

```
