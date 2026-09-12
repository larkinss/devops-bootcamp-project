import { emblemSvg } from './emblems.js';
import { escapeHtml } from './dom.js';
import { renderTelemetry } from './telemetry.js';

export function shouldUseFallback({ gl, reducedMotion }) {
  return !gl || !!reducedMotion;
}

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function renderFallback(root, params, callsign, note = 'Static view — motion off (reduced-motion or no WebGL).') {
  const el = document.createElement('div');
  el.className = 'fallback';
  el.style.setProperty('--ship-color', params.color);
  el.innerHTML = `
    <div class="badge">${emblemSvg(params.emblem)}</div>
    <h1 class="ship-name">${escapeHtml(params.shipName)}</h1>
    <p class="callsign">${callsign ? '@' + escapeHtml(callsign) : 'callsign set at launch'}</p>
    <div class="swatch"></div>
    <p class="note">${note}</p>
  `;
  root.append(el);
  renderTelemetry(root, params, callsign); // same readout as the live view (reduced-motion parity)
}
