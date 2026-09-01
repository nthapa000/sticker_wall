import test from 'node:test';
import assert from 'node:assert';
import { validate } from '../src/core/validate.js';
import {
  nightMarket,
  badRange,
  badDuplicateId,
  badK,
  badNonfinite,
} from '../src/data/collections.js';

test('validate: valid collection passes', () => {
  const result = validate(nightMarket);
  assert.strictEqual(result.ok, true, 'Night Market should be valid');
  assert.strictEqual(result.errors.length, 0);
});

test('validate: coordinate out of range', () => {
  const result = validate(badRange);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === 'range'), 'should have range error');
  assert.ok(result.errors.some(e => e.item === 'test'), 'should identify the sticker');
  assert.ok(result.errors.some(e => e.field === 'w'), 'should identify the field');
});

test('validate: duplicate sticker id', () => {
  const result = validate(badDuplicateId);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === 'duplicate-id'), 'should have duplicate-id error');
  assert.ok(result.errors.some(e => e.item === 'dup'), 'should identify the duplicate id');
});

test('validate: k mismatch', () => {
  const result = validate(badK);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === 'k-mismatch'), 'should have k-mismatch error');
});

test('validate: non-finite coordinate', () => {
  const result = validate(badNonfinite);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === 'non-finite'), 'should have non-finite error');
  assert.ok(result.errors.some(e => e.item === 'test'), 'should identify the sticker');
});
