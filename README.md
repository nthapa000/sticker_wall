# Sticker Wall K-Means Curator

A k-means clustering visualization for sticker panels in a 2D warmth/sparkle space.

## Setup

```bash
# Install (no dependencies required for Step 1)
npm install
```

## Step 1: Engine & Fixtures (Current)

Core k-means algorithm, validation, geometry utilities, and test fixtures.

### Test

```bash
# Run all tests
node --test tests/*.test.js

# Single test file
node --test tests/kmeans.test.js
```

### What's Implemented

- **Core modules:** geometry, validation, k-means iterate function
- **Collections:** Night Market (10 stickers, 3 centres) + auxiliary fixtures
- **Tests:** 17 passing tests covering:
  - Squared distance calculation
  - Exact tie resolution by source order
  - Mean updates and empty centre retention
  - Convergence detection (iteration 3 for Night Market)
  - Validation (range, duplicate IDs, k-mismatch, non-finite)
- **Expected run:** Documented in `docs/EXPECTED_RUN.md` and tested

### Verification

✅ **Gate:** `node --test` passes all 17 tests

No visual output in Step 1 — this is pure algorithmic layer.

---

## Next Steps

**Step 2:** Shell, map visualization, and layout (SVG, HTML, CSS)
**Step 3:** Store, controls, and state management
**Step 4:** Inspector, editing, validation UI, and export

---

## Project Structure

```
src/
  data/collections.js      <- Fixtures
  core/geometry.js         <- sqDist, mean, movement
  core/validate.js         <- Validation logic
  core/kmeans.js           <- iterate() function
  state/                   <- Step 3
  ui/                      <- Steps 2-4
tests/
  *.test.js                <- Node tests
  expected-main-run.js     <- Expected algorithm output
docs/EXPECTED_RUN.md       <- Documented run steps
```

---

## Contributing

Follow `Plan.md` strictly — implement one step at a time. Each step has a gate (tests pass) before proceeding to the next.

See `.claude/CLAUDE.md` for code guidelines: inline comments, DRY, SOLID, functionality first.
