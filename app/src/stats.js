// Deterministic, dependency-free ship stats derived purely from identity. The
// same config yields the same numbers on every reload (no Date/random), so the
// readout reads as a stable "spec sheet", not noise. Each of the four classes
// has a distinct base profile; a small per-ship jitter — hashed from callsign +
// colour — makes two ships of the same class read a little differently.

const PROFILES = {
  fighter:     { thrust: 82, hull: 54, agility: 90, sensors: 63 },
  interceptor: { thrust: 95, hull: 40, agility: 84, sensors: 71 },
  hauler:      { thrust: 48, hull: 96, agility: 31, sensors: 55 },
  scout:       { thrust: 66, hull: 46, agility: 74, sensors: 95 },
};

const SPEC_ORDER = [
  ['thrust', 'THRUST'],
  ['hull', 'HULL'],
  ['agility', 'AGILITY'],
  ['sensors', 'SENSORS'],
];

// FNV-1a — small, stable, no deps. Same string → same 32-bit unsigned int.
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function shipStats({ shipModel, callsign = '', color = '' } = {}) {
  const base = PROFILES[shipModel] || PROFILES.fighter;
  const seed = hash32(`${shipModel}:${callsign}:${color}`);
  const specs = SPEC_ORDER.map(([key, label], i) => {
    const jitter = ((seed >>> (i * 5)) % 13) - 6; // a stable ±6 nudge, unique per spec
    return { key, label, value: clamp(base[key] + jitter, 1, 99) };
  });
  const serial = 'SN-' + (seed % 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return { specs, serial };
}
