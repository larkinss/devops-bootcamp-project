#!/usr/bin/env node
// The pre-flight gate. Validates ship.config.json and fails loud.
// `npm test` runs this; a non-zero exit = ABORT (the CI/CD 2 lesson).
import { readFile } from 'node:fs/promises';
import { validateConfig } from '../src/ship-schema.js';

const configPath = process.argv[2] || 'ship.config.json';

let text;
try {
  text = await readFile(configPath, 'utf8');
} catch (err) {
  console.error(`ABORT — cannot read ${configPath}: ${err.message}`);
  process.exit(1);
}

let cfg;
try {
  cfg = JSON.parse(text);
} catch (err) {
  console.error(`ABORT — ${configPath} is not valid JSON: ${err.message}`);
  process.exit(1);
}

const { ok, errors } = validateConfig(cfg);
if (!ok) {
  console.error(`ABORT — ${configPath} failed pre-flight:`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

console.log(`✓ pre-flight OK — "${cfg.shipName}" cleared for launch`);
process.exit(0);
