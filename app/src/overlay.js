import { emblemSvg } from './emblems.js';
import { escapeHtml } from './dom.js';

export function renderOverlay(root, params, callsign) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.style.setProperty('--ship-color', params.color);
  el.innerHTML = `
    <div class="badge">${emblemSvg(params.emblem)}</div>
    <h1 class="ship-name">${escapeHtml(params.shipName)}</h1>
    <p class="callsign">${callsign ? '@' + escapeHtml(callsign) : 'callsign set at launch'}</p>
  `;
  root.append(el);
  return el;
}
