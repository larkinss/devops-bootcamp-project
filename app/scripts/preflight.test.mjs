import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, 'preflight.mjs');
const fixture = (name) => path.join(here, '__fixtures__', name);
const run = (configPath) => spawnSync('node', [cli, configPath], { encoding: 'utf8' });

test('exits 0 on a valid config', () => {
  const r = run(fixture('valid.json'));
  assert.equal(r.status, 0, r.stderr);
});

test('exits 1 with ABORT on a bad colour', () => {
  const r = run(fixture('bad-color.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /ABORT/);
});

test('exits 1 on malformed JSON', () => {
  const r = run(fixture('bad-json.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /not valid JSON/);
});

test('exits 1 when the file is missing, surfacing the underlying cause', () => {
  const r = run(fixture('does-not-exist.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /ABORT/);
  assert.match(r.stderr, /ENOENT/); // the OS error, not just "cannot read"
});

test('exits 1 with ABORT on an unknown shipModel', () => {
  const r = run(fixture('bad-model.json'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /ABORT/);
  assert.match(r.stderr, /shipModel/);
});
