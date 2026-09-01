# Plan.md — Sticker Wall K-Means Curator

**Deadline:** 1 day (budget ~9h build + 1h buffer)
**Stack:** plain HTML + CSS + vanilla ES modules. No framework, no build step, no backend.
**Priority order:** correctness of the contract > required UI surfaces > polish > optional export.

---

## 1. Scope decisions (locked before coding)

| Question | Decision | Why |
|---|---|---|
| Wall geometry | Continuous 2D plane, warmth 0–10 on x, sparkle 0–10 on y | Centres land on fractional values such as (0.667, 2.667). A cell grid cannot represent that. |
| Render technology | Inline SVG, `viewBox="0 0 100 100"` data space plus margin, CSS-sized to `min(560px, 100%)` | Free hit-testing for sticker selection, scales cleanly, exportable to PNG later, no redraw loop. |
| Sticker artwork | Unicode glyphs drawn as SVG `<text>` | Zero assets, zero network, zero licensing. The brief supplies no assets and forbids a backend. |
| Sticker count | 10 in the main demo, 3–4 per auxiliary fixture | Brief asks for 8–12. A 30-sticker library is not required by any acceptance criterion. |
| k | 3 | Shows a real three-way boundary and still stays hand-verifiable. |
| Randomness | None anywhere | The contract forbids randomising coordinates and requires a documented, reproducible expected run. Variety comes from a fixture library, not a generator. |
| Test runner | `node --test` against pure modules, plus a `tests/tests.html` reporter | Core has no DOM dependency, so both hosts run the identical spec files. |

### Why not fetch ~30 stickers from a remote repository
- The brief caps a collection at 30 stickers but never asks for a sticker gallery.
- Network fetch adds a failure mode with no acceptance criterion behind it.
- Image licensing and attribution is real work with no marks attached.
- Glyphs render at any size and can be recoloured by panel without asset variants.
- If richer art is wanted later, swap the `glyph` field for an inline `<symbol>` id. The data model does not change.

---

## 2. Main collection: "Night Market"

Panels: **Frost Lane** (cool, quiet), **Neon Alley** (cool, energetic), **Ember Row** (warm).

### Initial centres (hard-coded, source order matters)

| # | id | label | warmth | sparkle |
|---|---|---|---|---|
| 1 | `frost` | Frost Lane | 2 | 2 |
| 2 | `neon` | Neon Alley | 2 | 8 |
| 3 | `ember` | Ember Row | 8 | 4 |

### Stickers (source order matters)

| # | id | glyph (codepoint) | warmth | sparkle |
|---|---|---|---|---|
| 1 | `moon` | U+1F319 crescent moon | 1 | 2 |
| 2 | `snowflake` | U+2744 snowflake | 0 | 1 |
| 3 | `mask` | U+1F3AD performing arts | 1 | 5 |
| 4 | `sparkler` | U+2728 sparkles | 1 | 9 |
| 5 | `rocket` | U+1F680 rocket | 3 | 9 |
| 6 | `balloon` | U+1F388 balloon | 5 | 7 |
| 7 | `lantern` | U+1F3EE paper lantern | 6 | 7 |
| 8 | `chilli` | U+1F336 hot pepper | 9 | 4 |
| 9 | `campfire` | U+1F525 fire | 8 | 2 |
| 10 | `sun` | U+2600 sun | 10 | 5 |

### How the four required conditions were engineered

- **Exact first-iteration tie.** `frost` and `neon` share warmth 2, so their perpendicular bisector is the line sparkle = 5. Any lattice point on it is exactly equidistant. `mask` at (1, 5) gives 1 + 9 = 10 to both, an exact integer equality in IEEE754, not merely within 1e-12. `ember` is 50 away, so the tie is genuinely two-way. Source order sends it to `frost`.
- **Later reassignment.** `lantern` at (6, 7) is warm enough to start in Ember Row, but once `ember` is pulled toward the hot corner by `chilli`, `campfire` and `sun`, it flips to Neon Alley in iteration 2.
- **Every panel non-empty at convergence.** 3 / 4 / 3 split.
- **Convergence in 2–8 iterations.** Converges at iteration 3.

### Documented expected run (independently recorded)

This table lives in `docs/EXPECTED_RUN.md` and in `tests/expected-main-run.js`.
**`src/` must never import either file.** The application computes these values from the sticker and centre data alone; the tests assert equality against the recorded copy.

**Iteration 1** — status RUNNING, total squared error **41.750**

| centre | members | updated centre | movement |
|---|---|---|---|
| frost | moon, snowflake, mask | (0.667, 2.667) | 1.491 |
| neon | sparkler, rocket, balloon | (3.000, 8.333) | 1.054 |
| ember | lantern, chilli, campfire, sun | (8.250, 4.500) | 0.559 |

Tie recorded: `mask` at squared distance 10 to both `frost` and `neon`; `frost` wins on source order.

**Iteration 2** — status RUNNING, total squared error **34.750**

| centre | members | updated centre | movement |
|---|---|---|---|
| frost | moon, snowflake, mask | (0.667, 2.667) | 0.000 |
| neon | sparkler, rocket, balloon, **lantern** | (3.750, 8.000) | 0.821 |
| ember | chilli, campfire, sun | (9.000, 3.667) | 1.121 |

**Iteration 3** — status **CONVERGED**, total squared error **34.750**, all movements 0.000, signature identical to iteration 2.

---

## 3. Auxiliary fixtures (candidate-authored tests)

### 3.1 Empty panel: "Quiet Corner"
Centres `calm` (1, 1) and `blaze` (9, 9). Stickers `pebble` (0, 0), `leaf` (2, 1), `mist` (1, 3).

- Iteration 1: all three join `calm`. `blaze` receives nothing and **retains (9, 9) exactly**, movement 0.000, no division by zero, no NaN. Total squared error 6.667.
- Iteration 2: identical signature, CONVERGED.
- The iteration detail panel must show the reason string for `blaze`: centre retained because the panel is empty.

### 3.2 Validation fixtures (at least three categories)

| Fixture | Injected fault | Expected rejection |
|---|---|---|
| `bad-range` | sticker warmth = 12 | coordinate outside 0–10, names the sticker id and the field |
| `bad-duplicate-id` | two stickers share an id | duplicate sticker id, names the id |
| `bad-k` | k = 3 with only 2 centres supplied | centre count must equal k |
| `bad-nonfinite` | sparkle = NaN | non-finite coordinate, names the item |

On any invalid result the store must clear iterations, assignments, panel membership and metrics before rendering the error. Test asserts the cleared state, not just the message.

---

## 4. Architecture

### 4.1 Layers (strict one-way dependency, no DOM below `ui/`)

```
data/collections.js      frozen literal fixtures
        |
core/geometry.js         sqDist, mean, movement, round3
core/validate.js         pure -> { ok, errors: [{ code, field, item }] }
core/kmeans.js           iterate(stickers, centres) -> snapshot     <-- the single operation
        |
state/store.js           history array, cursor, selection, subscribe/notify
        |
ui/*.js                  snapshot in, DOM out. Never computes.
        |
main.js                  wiring only
```

### 4.2 Data model

```js
// collection
{ id, theme, k, stickers: [{ id, label, glyph, w, s }],
                 centres:  [{ id, label, w, s }] }

// snapshot (one per iteration, immutable)
{ it, assign: [centreIdx],      // parallel to sticker source order
  sig,                          // assigned centre ids joined, the convergence key
  before: [{id,w,s}],           // centres used for assignment
  centres:[{id,w,s}],           // centres after update
  moves: [n], empties: [id], ties: [{ stickerId, centreIds }],
  sse, status }                 // READY | RUNNING | CONVERGED | NOT_CONVERGED
```

Variable names stay short: `w`, `s`, `d`, `sig`, `sse`, `it`, `cur`, `mem`.

### 4.3 The one rule that satisfies "Step and Run to End produce identical states"

There is exactly one function that advances state:

```js
step()      // store: history.push(iterate(last)) if status === RUNNING
runToEnd()  // store: while (status === RUNNING) step()
```

`runToEnd` never contains iteration maths. Identity is guaranteed by construction, and the test simply asserts `stepUntilDone() deepEquals runToEnd()` on the same collection.

### 4.4 Iteration order inside `iterate`

1. **Assign** every sticker by unrounded squared distance. Ties within `TOL = 1e-12` go to the earlier centre in source order.
2. **Update** each non-empty centre to the arithmetic mean of its members. Empty centre keeps its previous coordinates exactly and is recorded in `empties`.
3. **Measure** total squared error against the *updated* centre of the current assignment. No reassignment here.
4. **Check** the signature. Iteration 1 can never converge. Equality with the previous signature sets CONVERGED. Hitting `MAX_IT = 20` sets NOT_CONVERGED and keeps the twentieth state visible.

Rounding to 3 decimals happens only in `ui/`, never in `core/`.

### 4.5 File tree

```
sticker-wall/
  index.html
  styles/tokens.css
  styles/app.css
  src/
    data/collections.js
    core/geometry.js  core/validate.js  core/kmeans.js
    state/store.js
    ui/map.js  ui/panels.js  ui/metrics.js  ui/inspector.js
    ui/controls.js  ui/validation.js  ui/legend.js
    ui/exportJson.js
    main.js
  tests/
    geometry.test.js  kmeans.test.js  validate.test.js
    store.test.js     fixtures.test.js
    expected-main-run.js
    tests.html
  docs/EXPECTED_RUN.md
  Plan.md  README.md
```

---

## 5. Design system

### 5.1 Tokens (`styles/tokens.css`)

```css
:root{
  /* Okabe-Ito, colour-blind safe */
  --panel-1:#0072B2;  --panel-2:#E69F00;  --panel-3:#009E73;
  --ink:#111418; --ink-2:#4A5560; --line:#D7DDE3;
  --bg:#FBFCFD; --surface:#FFFFFF; --danger:#B3261E; --ok:#146C43;

  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
  --r-sm:6px; --r-md:10px;
  --fs-xs:12px; --fs-sm:14px; --fs-md:16px; --fs-lg:20px; --fs-xl:28px;
  --shadow:0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10);
  --motion:180ms cubic-bezier(.2,.8,.2,1);
}
@media (prefers-reduced-motion: reduce){ :root{ --motion:0ms; } }
```

All metric readouts use `font-variant-numeric: tabular-nums` so digits do not jitter between iterations.

### 5.2 Encoding without relying on colour

Each panel carries three redundant signals:

| Panel | Colour | Marker shape | Assignment line |
|---|---|---|---|
| Frost Lane | `--panel-1` | circle | solid |
| Neon Alley | `--panel-2` | square | dashed 4 2 |
| Ember Row | `--panel-3` | triangle | dotted 1 3 |

Centres: **initial** is a hollow ring with a dashed stroke, **current** is a filled marker with a crosshair. A faint connector shows the drift from initial to current.

### 5.3 Components and states

| Component | Variants | States |
|---|---|---|
| Button | primary (Step), secondary (Run to End, Load Demo), ghost-danger (Reset) | default, hover, focus-visible, active, disabled |
| StickerMarker | per panel, plus unassigned (grey, dashed outline) | default, hover, selected (2px ink halo), edited (dashed accent ring) |
| CentreMarker | initial, current | default, moved-this-iteration |
| PanelCard | per panel | populated, empty (shows "centre retained") |
| ValidationBanner | error, ok | `role="alert"`, blocks Step and Run to End |
| Inspector | closed, open | shows all k distances, the winner, and the tie explanation when relevant |

Accessibility: markers are `tabindex="0"` with `role="button"` and an `aria-label` carrying id, coordinates and current panel. Iteration status sits in an `aria-live="polite"` region.

### 5.4 Layout (three zones, not one box)

```
+--------------------------------------------------------------+
| Sticker Wall K-Means Curator      [status: RUNNING  iter 2/20]|
+---------------+------------------------------+---------------+
| Collection    |                              | Iteration     |
|  Night Market |     warmth / sparkle map     |  SSE 34.750   |
| Controls      |     (square SVG, axes,       |  movements    |
|  [Step]       |      gridlines, markers,     +---------------+
|  [Run to End] |      centres, assignment     | Panel cards   |
|  [Load Demo]  |      lines)                  |  Frost 3      |
|  [Reset]      |                              |  Neon  4      |
| Validation    |                              |  Ember 3      |
| Edit sticker  |                              +---------------+
|  w [ ] s [ ]  |     Legend (shape+colour+label)| Inspector   |
+---------------+------------------------------+---------------+
```

Below 900px the rails stack under the map. The map keeps a 1:1 aspect ratio at all widths.

---

## 6. Control behaviour

| Control | Action | Enabled when | Notes |
|---|---|---|---|
| **Load Demo** | Loads Night Market, validates, renders iteration 0 with markers plotted and no assignment lines | always | One action, as required. A dropdown next to it selects the auxiliary fixtures. |
| **Step** | Appends exactly one `iterate` snapshot | status is READY or RUNNING | Primary button. Disables itself on CONVERGED or NOT_CONVERGED. |
| **Run to End** | Loops `step()` until status leaves RUNNING | same as Step | Contains no maths of its own. |
| **Reset** | Restores the original stickers and original centres, clears history, selection and metrics | always | Ghost-danger styling, separated from the other three by a spacer so it is not mis-clicked. |

Editing a sticker coordinate clears iteration history, assignments and metrics, then restarts from the collection's **original** centres. An invalid edit is rejected visibly and leaves no stale groups or metrics behind.

### 6.1 Save Final Wall (enabled only on CONVERGED)

A fifth control, visually separated from Step / Run to End / Load Demo / Reset, since it is not a run-control but an export action.

| Property | Decision |
|---|---|
| Label | `Save Final Wall` |
| Enabled when | `status === CONVERGED` only. Disabled on READY, RUNNING, and NOT_CONVERGED, with a tooltip explaining why. |
| Position | Right rail, directly under the Panel Cards, not grouped with Step/Run to End/Reset |
| Formats | JSON summary (required to ship) and PNG snapshot of the map (stretch, cut first if time is short) |
| Data source | Reads only the **last** snapshot in history. Never recomputes anything. |
| Side effects | None. Purely a serialize-and-download action; does not mutate store state. |

**Why gate it on CONVERGED rather than "always available":**
- "Final" implies the run is done. Allowing a save mid-run (RUNNING) or on a NOT_CONVERGED twentieth-iteration state would produce a file that silently misrepresents itself as final.
- Gating also gives the control a real second state (disabled) to design for, per the button state table in section 5.3.

**JSON summary contents** (`ui/exportJson.js`, pure function of the final snapshot, no DOM):

```js
{
  collection: "Night Market",
  status: "CONVERGED",           // or NOT_CONVERGED, never RUNNING/READY
  iterations: 3,
  totalSquaredError: 34.75,
  centres: [
    { id: "frost", label: "Frost Lane", w: 0.667, s: 2.667, movement: 0 },
    { id: "neon",  label: "Neon Alley", w: 3.75,  s: 8.0,   movement: 0 },
    { id: "ember", label: "Ember Row",  w: 9.0,   s: 3.667, movement: 0 }
  ],
  panels: [
    { centreId: "frost", stickerIds: ["moon", "snowflake", "mask"] },
    { centreId: "neon",  stickerIds: ["sparkler", "rocket", "balloon", "lantern"] },
    { centreId: "ember", stickerIds: ["chilli", "campfire", "sun"] }
  ],
  generatedAt: "<ISO timestamp, wall-clock only, not part of the k-means state>"
}
```

Values here use the same 3-decimal display rounding as the UI (section 4.4), so what a user opens in the file matches what they last saw on screen. `panels` preserves sticker source order within each centre, consistent with the membership-list ordering rule in the contract.

Implementation: build the object, `JSON.stringify(obj, null, 2)`, wrap in a `Blob`, trigger via a hidden `<a download>` — no server round-trip, keeping computation local per the brief's constraints.

**PNG snapshot (stretch only):** serialize the live map `<svg>` via `XMLSerializer`, draw it onto an offscreen `<canvas>`, then `canvas.toBlob()` and download. This captures markers, centres, assignment lines and the legend exactly as rendered, so no separate "export renderer" needs to be built or kept in sync with `ui/map.js`.

Test coverage added for this feature (folded into Step 4's test list, see 7 below):
19. `exportJson(snapshot)` on the Night Market final snapshot matches a recorded fixture object exactly (id order, rounding, panel membership).
20. `exportJson` is disabled/unreachable (returns null or throws a guarded error) when called on a RUNNING or READY snapshot, proving the CONVERGED gate is enforced in `core`/`state`, not just hidden in the UI.
21. Save control's `disabled` attribute toggles correctly across all four statuses (READY, RUNNING, CONVERGED, NOT_CONVERGED) in a UI-level test.

---

## 7. Implementation in four steps

### Step 1 — Engine and fixtures (~2h, no UI at all)
Build: `geometry.js`, `validate.js`, `kmeans.js`, `data/collections.js`, `docs/EXPECTED_RUN.md`.

Tests written in this step:
1. `sqDist` on known pairs, including a zero-distance case.
2. Exact tie: `mask` returns 10 to both `frost` and `neon`, and resolves to `frost`.
3. Mean update: a three-member panel produces the arithmetic mean.
4. Empty-panel retention: `blaze` keeps (9, 9) exactly, movement 0, no NaN.
5. Squared error measured against updated centres.
6. Signature convergence: iteration 1 is never converged; CONVERGED fires on the first repeat.
7. Worked example from the brief reproduces 42.333, then 21.5, converged at iteration 3.
8. Night Market reproduces `tests/expected-main-run.js` for all three iterations.
9. Validation: range, duplicate id, k-versus-centre-count, non-finite.

**Gate:** `node --test` green before any CSS is written.

### Step 2 — Shell and map (~2.5h)
Build: `index.html`, tokens and app CSS, `ui/map.js`, `ui/legend.js`, three-zone layout.

- SVG plane with axes labelled Warmth and Sparkle, integer gridlines, tick labels.
- Sticker markers at true coordinates with glyph, id label and per-panel shape.
- Initial centres as hollow rings, current centres as filled crosshairs, drift connector.
- Legend using shape plus colour plus text.

Tests: render `snapshot0` for Night Market and assert marker count, plus a manual checklist (greyscale screenshot readable, focus ring visible, layout holds at 900px and 380px).

### Step 3 — Store, controls, panels and metrics (~2.5h)
Build: `state/store.js`, `ui/controls.js`, `ui/panels.js`, `ui/metrics.js`, assignment lines.

Tests written in this step:
10. `step()` repeated to completion deep-equals `runToEnd()` on Night Market and on Quiet Corner.
11. `step()` is a no-op once status is CONVERGED.
12. Later reassignment: `lantern` is in `ember` at iteration 1 and in `neon` at iteration 2.
13. `MAX_IT` guard reaches NOT_CONVERGED and preserves the twentieth snapshot (synthetic fixture with a stubbed check).
14. Reset restores the exact original stickers and centres and empties the history.

### Step 4 — Inspector, editing, validation, save, and docs (~2.5h)
Build: `ui/inspector.js`, `ui/validation.js`, edit form, `ui/exportJson.js`, README.

Tests written in this step:
15. Inspector for `mask` lists all three unrounded distances, the winner, and the source-order tie explanation.
16. Editing `lantern` warmth to 2 clears history and restarts from the original centres.
17. Editing to 12 is rejected, history stays empty, panel cards and metrics render no stale values.
18. Empty-panel fixture surfaces the retained-centre reason string in the iteration detail.
19. `exportJson(snapshot)` on the Night Market final snapshot matches the recorded fixture exactly.
20. `exportJson` refuses a RUNNING or READY snapshot (the CONVERGED gate lives in code, not just markup).
21. Save Final Wall control's `disabled` state toggles correctly across all four statuses.

**JSON summary export is now a required Step 4 deliverable, not a stretch item.** It is small (one pure function plus one download trigger) and directly answers "save the final sticker panel after converging."

**Stretch, only if the clock allows:** PNG snapshot of the map via canvas serialisation of the live SVG. This is the "print" box from the sketch, relabelled Save Final Wall and moved to the right rail, gated on convergence rather than always-on.

---

## 8. Risks and cut lines

| Risk | Mitigation | Cut line |
|---|---|---|
| Time overrun on visual polish | Tokens are defined once in Step 2 and reused | Drop motion, drop hover states, keep focus rings |
| Glyph rendering differs per OS | Marker shape and text label carry the meaning; the glyph is decoration | Fall back to the id text alone |
| Editing flow balloons into a full collection editor | Only one sticker is editable at a time via a two-field form | Restrict editing to the selected sticker |
| Export eats the buffer | Scheduled last | Ship without it. It is optional in the brief. |
