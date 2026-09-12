import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from './dom.js';

test('escapeHtml neutralises HTML metacharacters', () => {
  assert.equal(escapeHtml('<script>&"\''), '&lt;script&gt;&amp;&quot;&#39;');
});

test('escapeHtml stringifies non-strings', () => {
  assert.equal(escapeHtml(42), '42');
});
