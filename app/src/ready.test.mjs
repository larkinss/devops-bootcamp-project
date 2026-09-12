import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readyHref } from './ready.js';

test('returns null when boardUrl is falsy', () => {
  assert.equal(readyHref('', 'octocat'), null);
  assert.equal(readyHref(null, 'octocat'), null);
  assert.equal(readyHref(undefined, 'octocat'), null);
});

test('returns null when callsign is falsy', () => {
  assert.equal(readyHref('https://board.example.com', ''), null);
  assert.equal(readyHref('https://board.example.com', null), null);
  assert.equal(readyHref('https://board.example.com', undefined), null);
});

test('strips a trailing slash from boardUrl', () => {
  assert.equal(
    readyHref('https://board.example.com/', 'octocat'),
    'https://board.example.com/play?callsign=octocat',
  );
  assert.equal(
    readyHref('https://board.example.com', 'octocat'),
    'https://board.example.com/play?callsign=octocat',
  );
});

test('encodeURIComponents the callsign', () => {
  assert.equal(
    readyHref('https://board.example.com', 'space cadet'),
    'https://board.example.com/play?callsign=space%20cadet',
  );
  assert.equal(
    readyHref('https://board.example.com', 'a&b=c'),
    'https://board.example.com/play?callsign=a%26b%3Dc',
  );
});
