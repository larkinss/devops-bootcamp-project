// Build/deploy facts baked in at build time. __BUILD_SHA__ and __BUILD_TIME__
// are Vite `define` replacements (see vite.config.js); callsign is injected via
// VITE_CALLSIGN when the pipeline builds. All have safe fallbacks so a plain
// `npm run dev` (or a non-git checkout) never crashes.
/* global __BUILD_SHA__, __BUILD_TIME__ */
export const buildMeta = {
  sha: typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev',
  time: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '',
};
