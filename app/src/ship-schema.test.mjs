import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMBLEMS, SHIP_IDS, SHIPS, DEFAULT_SHIP, hueOf,
  validateConfig, toRenderParams, DEFAULTS,
} from './ship-schema.js';

const good = { shipName: 'Nebula Runner', color: '#22d3ee', shipModel: 'fighter', emblem: 'comet' };
const approx = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('validateConfig accepts a well-formed config', () => {
  const r = validateConfig(good);
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, []);
});

test('validateConfig rejects a bad colour', () => {
  const r = validateConfig({ ...good, color: 'blurple' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /colour|color/i);
});

test('validateConfig accepts a named colour; toRenderParams resolves it to hex', () => {
  assert.equal(validateConfig({ ...good, color: 'blue' }).ok, true);
  assert.equal(toRenderParams({ ...good, color: 'Blue' }).color, '#3b82f6'); // case-insensitive → hex
});

test('validateConfig rejects an unknown emblem', () => {
  const r = validateConfig({ ...good, emblem: 'banana' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /emblem/);
});

test('validateConfig rejects an unknown shipModel', () => {
  const r = validateConfig({ ...good, shipModel: 'battlecruiser' });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /shipModel|ship model/i);
});

test('validateConfig rejects a missing shipModel', () => {
  const { shipModel, ...noModel } = good;
  assert.equal(validateConfig(noModel).ok, false);
});

test('validateConfig rejects an over-long shipName', () => {
  assert.equal(validateConfig({ ...good, shipName: 'x'.repeat(25) }).ok, false);
});

test('validateConfig accepts a 24-char name padded with whitespace', () => {
  const padded = '  ' + 'x'.repeat(24) + '  ';
  assert.equal(validateConfig({ ...good, shipName: padded }).ok, true);
  assert.equal(toRenderParams({ ...good, shipName: padded }).shipName, 'x'.repeat(24));
});

test('validateConfig rejects a non-object', () => {
  assert.equal(validateConfig(null).ok, false);
  assert.equal(validateConfig([]).ok, false);
});

test('toRenderParams falls back to DEFAULTS on garbage', () => {
  assert.deepEqual(toRenderParams({ shipName: '', color: 'nope', shipModel: 'x', emblem: 'x' }), DEFAULTS);
  assert.deepEqual(toRenderParams(null), DEFAULTS);
});

test('toRenderParams keeps valid values and trims shipName', () => {
  const p = toRenderParams({ shipName: '  Comet  ', color: '#ABCDEF', shipModel: 'scout', emblem: 'bolt' });
  assert.deepEqual(p, { shipName: 'Comet', color: '#ABCDEF', shipModel: 'scout', emblem: 'bolt' });
});

test('DEFAULTS.shipModel is the default ship and is a known id', () => {
  assert.equal(DEFAULTS.shipModel, DEFAULT_SHIP);
  assert.ok(SHIP_IDS.includes(DEFAULT_SHIP));
});

test('every ship has an id, file and label', () => {
  for (const s of SHIPS) {
    assert.match(s.id, /^[a-z]+$/);
    assert.match(s.file, /\.glb$/);
    assert.equal(typeof s.label, 'string');
  }
});

test('hueOf: greyscale or invalid colour → null (leave the baked paint)', () => {
  assert.equal(hueOf('#808080'), null);
  assert.equal(hueOf('not-a-color'), null);
  assert.equal(hueOf(null), null);
});

test('hueOf: pure red → hue 0', () => {
  approx(hueOf('#ff0000'), 0);
});

test('hueOf: cyan → ~188°/360 of the wheel', () => {
  approx(hueOf('#22d3ee'), 188 / 360, 0.01);
});

test('hueOf: always returns a fraction in [0, 1) for a saturated colour', () => {
  for (const c of ['#ff0000', '#00ff00', '#0000ff', '#ec4899', '#84cc16']) {
    const h = hueOf(c);
    assert.ok(h >= 0 && h < 1, `${c} → ${h}`);
  }
});

test('all EMBLEMS are lowercase words', () => {
  for (const e of EMBLEMS) assert.match(e, /^[a-z]+$/);
});
