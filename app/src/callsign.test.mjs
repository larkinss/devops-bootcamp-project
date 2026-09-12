import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callsignFromHostname } from './callsign.js';

test('extracts the username from a github.io hostname', () => {
  assert.equal(callsignFromHostname('octocat.github.io'), 'octocat');
  assert.equal(callsignFromHostname('My-User.github.io'), 'my-user'); // lowercased
});

test('returns empty for non-Pages hostnames', () => {
  assert.equal(callsignFromHostname('localhost'), '');
  assert.equal(callsignFromHostname('example.com'), '');
  assert.equal(callsignFromHostname('octocat.github.io.evil.com'), '');
  assert.equal(callsignFromHostname(''), '');
  assert.equal(callsignFromHostname(undefined), '');
});
