import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldUseFallback } from './fallback.js';

test('uses the scene when WebGL is present and motion is allowed', () => {
  assert.equal(shouldUseFallback({ gl: true, reducedMotion: false }), false);
});

test('falls back when WebGL is missing', () => {
  assert.equal(shouldUseFallback({ gl: false, reducedMotion: false }), true);
});

test('falls back when the user prefers reduced motion', () => {
  assert.equal(shouldUseFallback({ gl: true, reducedMotion: true }), true);
});
