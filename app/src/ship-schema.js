// Pure config core — no browser/node-only imports, so both the CLI gate
// (Node) and the site (Vite) can import it.
export const EMBLEMS = ['comet', 'bolt', 'star', 'ring', 'delta', 'phoenix'];
export const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// Named colours a learner may write instead of a hex string. Each resolves to
// the hex beside it; the ship then hue-sets from that. white/gray/black are
// low-saturation, so they leave the baked paint neutral (see hueOf).
export const NAMED_COLORS = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
  lime: '#84cc16', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6',
  cyan: '#22d3ee', sky: '#38bdf8', blue: '#3b82f6', indigo: '#6366f1',
  violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef', pink: '#ec4899',
  rose: '#f43f5e', white: '#f8fafc', gray: '#94a3b8', grey: '#94a3b8',
  black: '#0f172a',
};
export const COLOR_NAMES = Object.keys(NAMED_COLORS);

// Resolve a config colour — a hex string OR a NAMED_COLORS key (case-insensitive)
// — to a canonical #rrggbb, or null if it is neither. Hex passes through as-is,
// so everything downstream (hueOf, the board) only ever sees hex.
export function normalizeColor(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim();
  if (COLOR_RE.test(s)) return s;
  return NAMED_COLORS[s.toLowerCase()] ?? null;
}

// The choosable ships. All four share one baked texture atlas; each mesh's UVs
// sample different swatches, so there is no reliable per-model "base hue". The
// site recolours a ship by SETTING every saturated texel to `color`'s hue (see
// hueOf), which lands exactly on the chosen colour regardless of the model.
export const SHIPS = [
  { id: 'fighter',     file: 'fighter.glb',     label: 'Fighter' },
  { id: 'interceptor', file: 'interceptor.glb', label: 'Interceptor' },
  { id: 'hauler',      file: 'hauler.glb',      label: 'Hauler' },
  { id: 'scout',       file: 'scout.glb',       label: 'Scout' },
];
export const SHIP_IDS = SHIPS.map((s) => s.id);
export const DEFAULT_SHIP = 'fighter';
export const DEFAULTS = { shipName: 'Nebula Runner', color: '#22d3ee', shipModel: DEFAULT_SHIP, emblem: 'comet' };

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// The hue of `color` as a fraction of the colour wheel [0, 1), which the ship
// shader sets on every saturated texel. Returns null for a (near-)greyscale or
// invalid colour, which leaves the baked paint untouched (greys stay grey).
export function hueOf(color) {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(typeof color === 'string' ? color : '');
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.15) return null;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return h / 360;
}

// Strict — the pre-flight gate. Returns every problem it finds.
export function validateConfig(cfg) {
  if (!isObject(cfg)) return { ok: false, errors: ['config must be a JSON object'] };
  const errors = [];
  const name = typeof cfg.shipName === 'string' ? cfg.shipName.trim() : '';
  if (name.length < 1 || name.length > 24) {
    errors.push('shipName must be a non-empty string of at most 24 characters');
  }
  if (normalizeColor(cfg.color) === null) {
    errors.push('color must be a hex string like #22d3ee or a colour name like red');
  }
  if (typeof cfg.shipModel !== 'string' || !SHIP_IDS.includes(cfg.shipModel)) {
    errors.push(`shipModel must be one of: ${SHIP_IDS.join(', ')}`);
  }
  if (typeof cfg.emblem !== 'string' || !EMBLEMS.includes(cfg.emblem)) {
    errors.push(`emblem must be one of: ${EMBLEMS.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

// Lenient — the browser. Always returns usable params so a bad config
// (which the gate would have blocked anyway) never white-screens the site.
export function toRenderParams(cfg) {
  const raw = isObject(cfg) ? cfg : {};
  const shipName =
    typeof raw.shipName === 'string' && raw.shipName.trim() ? raw.shipName.trim().slice(0, 24) : DEFAULTS.shipName;
  const color = normalizeColor(raw.color) || DEFAULTS.color;
  const shipModel = typeof raw.shipModel === 'string' && SHIP_IDS.includes(raw.shipModel) ? raw.shipModel : DEFAULTS.shipModel;
  const emblem = typeof raw.emblem === 'string' && EMBLEMS.includes(raw.emblem) ? raw.emblem : DEFAULTS.emblem;
  return { shipName, color, shipModel, emblem };
}
