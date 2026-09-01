import test from 'node:test';
import assert from 'node:assert';
import { sqDist, mean, movement } from '../src/core/geometry.js';

test('sqDist: known pairs', () => {
  // Test case 1: (0, 0) to (3, 4) = 25
  const p1 = { w: 0, s: 0 };
  const p2 = { w: 3, s: 4 };
  assert.strictEqual(sqDist(p1, p2), 25, 'should compute 3-4-5 triangle squared');

  // Test case 2: zero distance
  const p3 = { w: 5, s: 5 };
  const p4 = { w: 5, s: 5 };
  assert.strictEqual(sqDist(p3, p4), 0, 'should be 0 for identical points');
});

test('mean: arithmetic mean of points', () => {
  // Three-member panel from Night Market iteration 1
  const points = [
    { w: 1, s: 2 },    // moon
    { w: 0, s: 1 },    // snowflake
    { w: 1, s: 5 },    // mask
  ];
  const result = mean(points);
  assert.strictEqual(Math.round(result.w * 1000) / 1000, 0.667, 'warmth mean');
  assert.strictEqual(Math.round(result.s * 1000) / 1000, 2.667, 'sparkle mean');
});

test('mean: empty array returns null', () => {
  assert.strictEqual(mean([]), null);
});

test('movement: distance between before and after centres', () => {
  // Frost centre from iteration 1
  const before = { w: 2, s: 2 };
  const after = { w: 0.6666666666666666, s: 2.6666666666666665 };
  const result = movement(before, after);
  assert.ok(Math.abs(result - 1.491) < 0.01, `movement should be ~1.491, got ${result}`);
});

test('movement: zero movement', () => {
  const p = { w: 5, s: 5 };
  assert.strictEqual(movement(p, p), 0);
});
