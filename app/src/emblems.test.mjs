import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMBLEMS } from './ship-schema.js';
import { emblemSvg } from './emblems.js';

test('every allowed emblem has an <svg>', () => {
  for (const name of EMBLEMS) {
    assert.match(emblemSvg(name), /^<svg/, `missing svg for ${name}`);
  }
});

test('unknown emblem falls back to comet', () => {
  assert.equal(emblemSvg('banana'), emblemSvg('comet'));
});

test('inherited Object keys fall back to comet, not a prototype member', () => {
  for (const name of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
    assert.equal(emblemSvg(name), emblemSvg('comet'), `${name} should fall back to comet`);
  }
});
