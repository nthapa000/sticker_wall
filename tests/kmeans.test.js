import test from 'node:test';
import assert from 'node:assert';
import { iterate } from '../src/core/kmeans.js';
import { nightMarket, quietCorner } from '../src/data/collections.js';
import { expectedMainRun } from './expected-main-run.js';

test('kmeans: exact tie resolves by source order', () => {
  // mask (1, 5) is equidistant (10) from frost (2, 2) and neon (2, 8)
  const snapshot = iterate(nightMarket.stickers, nightMarket.centres);

  // Find mask's assignment
  const maskIdx = nightMarket.stickers.findIndex(s => s.id === 'mask');
  const maskCentreIdx = snapshot.assign[maskIdx];
  assert.strictEqual(maskCentreIdx, 0, 'mask should assign to frost (index 0) on tie');

  // Verify tie was recorded
  assert.strictEqual(snapshot.ties.length, 1, 'should record one tie');
  assert.strictEqual(snapshot.ties[0].stickerId, 'mask');
  assert.ok(snapshot.ties[0].centreIds.includes('frost'));
  assert.ok(snapshot.ties[0].centreIds.includes('neon'));
});

test('kmeans: empty panel retention (Quiet Corner)', () => {
  const snapshot = iterate(quietCorner.stickers, quietCorner.centres);

  // All stickers should assign to calm (index 0)
  assert.ok(snapshot.assign.every((idx, i) => {
    // First 3 stickers should all be in centre 0 (calm)
    if (i < 3) return idx === 0;
    return true;
  }), 'all stickers should assign to calm');

  // blaze (centre 1) should be recorded as empty
  assert.ok(snapshot.empties.includes('blaze'), 'blaze should be recorded as empty');

  // blaze should retain its original coordinates exactly
  const blazeIdx = 1;
  assert.strictEqual(snapshot.centres[blazeIdx].w, 9, 'blaze w should stay 9');
  assert.strictEqual(snapshot.centres[blazeIdx].s, 9, 'blaze s should stay 9');

  // blaze movement should be 0
  assert.strictEqual(snapshot.moves[blazeIdx], 0, 'blaze movement should be 0');

  // No NaN anywhere
  assert.ok(!isNaN(snapshot.sse), 'sse should not be NaN');
});

test('kmeans: night market iteration 1', () => {
  const snap1 = iterate(nightMarket.stickers, nightMarket.centres);
  const expected = expectedMainRun[0];

  assert.strictEqual(snap1.it, 1);
  assert.strictEqual(snap1.status, 'RUNNING');
  assert.strictEqual(snap1.empties.length, 0, 'no empty centres at iteration 1');
  assert.strictEqual(snap1.ties.length, 1, 'one tie at iteration 1');

  // Check SSE is close (within rounding tolerance)
  assert.ok(Math.abs(snap1.sse - expected.sse) < 0.01,
    `SSE mismatch: expected ${expected.sse}, got ${snap1.sse}`);
});

test('kmeans: night market iteration 2 (lantern reassigns)', () => {
  const snap1 = iterate(nightMarket.stickers, nightMarket.centres);
  const snap2 = iterate(nightMarket.stickers, snap1.centres, snap1);
  const expected = expectedMainRun[1];

  assert.strictEqual(snap2.it, 2);
  assert.strictEqual(snap2.status, 'RUNNING');

  // Verify lantern reassigned
  const lanternIdx = nightMarket.stickers.findIndex(s => s.id === 'lantern');
  const snap1Centre = snap1.assign[lanternIdx];
  const snap2Centre = snap2.assign[lanternIdx];
  assert.notStrictEqual(snap1Centre, snap2Centre, 'lantern should move between iterations');

  // Check SSE
  assert.ok(Math.abs(snap2.sse - expected.sse) < 0.01);
});

test('kmeans: night market converges at iteration 3', () => {
  let snapshot = iterate(nightMarket.stickers, nightMarket.centres);
  assert.strictEqual(snapshot.status, 'RUNNING');

  snapshot = iterate(nightMarket.stickers, snapshot.centres, snapshot);
  assert.strictEqual(snapshot.status, 'RUNNING');

  snapshot = iterate(nightMarket.stickers, snapshot.centres, snapshot);
  assert.strictEqual(snapshot.status, 'CONVERGED', 'should converge at iteration 3');
  assert.strictEqual(snapshot.it, 3);

  // All movements should be 0
  assert.ok(snapshot.moves.every(m => m === 0), 'all movements should be 0 at convergence');
});

test('kmeans: iteration 1 can never converge', () => {
  const snap1 = iterate(nightMarket.stickers, nightMarket.centres);
  assert.strictEqual(snap1.status, 'RUNNING', 'iteration 1 must never converge');
});

test('kmeans: identical signature triggers convergence', () => {
  let snapshot = iterate(nightMarket.stickers, nightMarket.centres);
  const sig1 = snapshot.sig;

  snapshot = iterate(nightMarket.stickers, snapshot.centres, snapshot);
  const sig2 = snapshot.sig;
  assert.notStrictEqual(sig1, sig2, 'sig should change at iteration 2 (lantern reassigns)');
  assert.strictEqual(snapshot.status, 'RUNNING', 'iteration 2 is still RUNNING');

  snapshot = iterate(nightMarket.stickers, snapshot.centres, snapshot);
  const sig3 = snapshot.sig;
  assert.strictEqual(sig2, sig3, 'sig should match between iteration 2 and 3');
  assert.strictEqual(snapshot.status, 'CONVERGED', 'iteration 3 should be CONVERGED');
});
