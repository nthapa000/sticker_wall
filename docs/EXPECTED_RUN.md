# Expected Run: Night Market

This is the documented, independently recorded expected run of the Night Market collection through the k-means algorithm. The application computes these values from the sticker and centre data alone; tests assert equality against this recorded copy.

## Iteration 1 — RUNNING

**Status:** RUNNING | **Total Squared Error:** 41.750

| Centre | Members | Updated Centre | Movement |
|---|---|---|---|
| frost | moon, snowflake, mask | (0.667, 2.667) | 1.491 |
| neon | sparkler, rocket, balloon | (3.000, 8.333) | 1.054 |
| ember | lantern, chilli, campfire, sun | (8.250, 4.500) | 0.559 |

**Tie:** `mask` at squared distance 10 to both `frost` and `neon`; `frost` wins on source order.

---

## Iteration 2 — RUNNING

**Status:** RUNNING | **Total Squared Error:** 34.750

| Centre | Members | Updated Centre | Movement |
|---|---|---|---|
| frost | moon, snowflake, mask | (0.667, 2.667) | 0.000 |
| neon | sparkler, rocket, balloon, **lantern** | (3.750, 8.000) | 0.821 |
| ember | chilli, campfire, sun | (9.000, 3.667) | 1.121 |

Note: `lantern` has reassigned from `ember` to `neon`.

---

## Iteration 3 — CONVERGED

**Status:** CONVERGED | **Total Squared Error:** 34.750 | **All movements:** 0.000

| Centre | Members | Updated Centre | Movement |
|---|---|---|---|
| frost | moon, snowflake, mask | (0.667, 2.667) | 0.000 |
| neon | sparkler, rocket, balloon, lantern | (3.750, 8.000) | 0.000 |
| ember | chilli, campfire, sun | (9.000, 3.667) | 0.000 |

Signature identical to iteration 2 — convergence detected.
