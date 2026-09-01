import test from 'node:test';
import assert from 'node:assert';
import { createStore } from '../src/state/store.js';
import { nightMarket, quietCorner } from '../src/data/collections.js';

test('Step 3: step() repeated to completion matches runToEnd() on Night Market', () => {
  // Run with step()
  const store1 = createStore(JSON.parse(JSON.stringify(nightMarket)));
  while (store1.status === 'RUNNING' || store1.status === 'READY') {
    store1.step();
    if (store1.status === 'CONVERGED' || store1.status === 'NOT_CONVERGED') break;
  }
  const historyFromStep = store1.snapshots.map(s => ({ it: s.it, status: s.status, sse: s.sse }));

  // Run with runToEnd()
  const store2 = createStore(JSON.parse(JSON.stringify(nightMarket)));
  store2.runToEnd();
  const historyFromRunEnd = store2.snapshots.map(s => ({ it: s.it, status: s.status, sse: s.sse }));

  assert.deepStrictEqual(historyFromStep, historyFromRunEnd, 'step() loop should match runToEnd()');
});

test('Step 3: step() is no-op once status is CONVERGED', () => {
  const store = createStore(JSON.parse(JSON.stringify(nightMarket)));
  store.runToEnd();

  const finalLength = store.snapshots.length;
  const finalStatus = store.status;
  assert.strictEqual(finalStatus, 'CONVERGED', 'should be CONVERGED');

  // Call step when CONVERGED
  store.step();

  // History should not change
  assert.strictEqual(store.snapshots.length, finalLength, 'history should not grow');
  assert.strictEqual(store.status, 'CONVERGED', 'status should stay CONVERGED');
});

test('Step 3: lantern reassigns from ember to neon (later reassignment)', () => {
  const store = createStore(JSON.parse(JSON.stringify(nightMarket)));

  // Iteration 1
  store.step();
  const snap1 = store.currentSnapshot;
  const lanternIdx = nightMarket.stickers.findIndex(s => s.id === 'lantern');
  const lanternCentre1 = snap1.assign[lanternIdx];
  assert.strictEqual(lanternCentre1, 2, 'lantern should be in ember (index 2) at iteration 1');

  // Iteration 2
  store.step();
  const snap2 = store.currentSnapshot;
  const lanternCentre2 = snap2.assign[lanternIdx];
  assert.strictEqual(lanternCentre2, 1, 'lantern should be in neon (index 1) at iteration 2');
});

test('Step 3: reset restores original collection and empties history', () => {
  const store = createStore(JSON.parse(JSON.stringify(nightMarket)));

  // Take some steps
  store.step();
  store.step();
  assert.strictEqual(store.snapshots.length, 3, 'should have 3 snapshots (0, 1, 2)');

  // Reset
  store.reset();

  // Check history and state
  assert.strictEqual(store.snapshots.length, 1, 'history should only have snapshot0');
  assert.strictEqual(store.currentSnapshot.it, 0, 'current snapshot should be iteration 0');
  assert.strictEqual(store.status, 'READY', 'status should be READY');

  // Verify original collection restored
  const originalMoon = nightMarket.stickers.find(s => s.id === 'moon');
  const currentMoon = store.collection.stickers.find(s => s.id === 'moon');
  assert.strictEqual(currentMoon.w, originalMoon.w, 'moon warmth should be restored');
  assert.strictEqual(currentMoon.s, originalMoon.s, 'moon sparkle should be restored');
});

test('Step 3: quiet corner convergence on Night Market pattern', () => {
  const store = createStore(JSON.parse(JSON.stringify(quietCorner)));
  store.runToEnd();

  const finalSnapshot = store.currentSnapshot;
  assert.strictEqual(finalSnapshot.status, 'CONVERGED', 'Quiet Corner should converge');

  // All stickers should be in calm (centre 0)
  assert.ok(finalSnapshot.assign.slice(0, 3).every(idx => idx === 0), 'all stickers should be in calm');

  // blaze should be marked as empty
  assert.ok(finalSnapshot.empties.includes('blaze'), 'blaze should be in empties list');

  // blaze should retain its coordinates
  const blazeCentre = finalSnapshot.centres[1];
  assert.strictEqual(blazeCentre.w, 9, 'blaze w should be 9');
  assert.strictEqual(blazeCentre.s, 9, 'blaze s should be 9');
});

test('Step 3: subscribe callback fires on store change', () => {
  const store = createStore(JSON.parse(JSON.stringify(nightMarket)));

  let callCount = 0;
  const unsubscribe = store.subscribe(() => {
    callCount++;
  });

  // Initial subscription doesn't trigger the callback (subscriber added after construction)
  assert.strictEqual(callCount, 0, 'initial subscription should not trigger callback');

  store.step();
  assert.strictEqual(callCount, 1, 'subscriber should be called on step()');

  store.step();
  assert.strictEqual(callCount, 2, 'subscriber should be called again on step()');

  unsubscribe();
  store.step();
  assert.strictEqual(callCount, 2, 'unsubscribed callback should not fire');
});
