// Inline SVGs, one per allowed emblem. `currentColor` lets CSS tint them.
const SVGS = {
  comet: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="15" cy="9" r="5"/><path d="M3 21 L11 13" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="13,2 4,14 11,14 9,22 20,9 13,9"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9"/></svg>',
  ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>',
  delta: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,3 21,20 3,20"/></svg>',
  phoenix: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12,3 20,20 12,15 4,20"/></svg>',
};

export function emblemSvg(name) {
  return Object.hasOwn(SVGS, name) ? SVGS[name] : SVGS.comet;
}
