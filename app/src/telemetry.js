import { SHIPS } from './ship-schema.js';
import { shipStats } from './stats.js';
import { buildMeta } from './build-meta.js';
import { escapeHtml } from './dom.js';

// "2026-07-15T14:22:33.000Z" → "2026-07-15 14:22 UTC" (string-sliced, so it is
// deterministic and locale-free).
function fmtTime(iso) {
  return typeof iso === 'string' && iso.length >= 16
    ? `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
    : '—';
}

const row = (k, v) => `<div class="tm-row"><span class="tm-k">${k}</span><span class="tm-val">${v}</span></div>`;

// Pure string builder — mirrors the overlay.js pattern so it stays trivially
// inspectable. All dynamic values are escaped.
export function telemetryHtml(params, callsign = '') {
  const model = SHIPS.find((s) => s.id === params.shipModel) || SHIPS[0];
  const { specs, serial } = shipStats({ shipModel: params.shipModel, callsign, color: params.color });

  const specRows = specs
    .map(
      (s) => `
      <div class="tm-spec">
        <span class="tm-k">${s.label}</span>
        <span class="tm-bar" style="--v:${s.value}"><i></i></span>
        <span class="tm-num">${String(s.value).padStart(2, '0')}</span>
      </div>`,
    )
    .join('');

  const sign = callsign ? '@' + escapeHtml(callsign) : '— set at launch';

  return `
    <button class="tm-toggle" type="button" aria-expanded="true" aria-label="Toggle telemetry">▾</button>
    <div class="tm-body">
      <div class="tm-head"><span class="tm-led"></span>SYSTEMS NOMINAL</div>
      <div class="tm-class">SHIP CLASS · ${escapeHtml(model.label.toUpperCase())}</div>
      <div class="tm-specs">${specRows}</div>
      <div class="tm-deploy">
        ${row('CALLSIGN', sign)}
        ${row('BUILD', escapeHtml(buildMeta.sha))}
        ${row('SHIPPED', fmtTime(buildMeta.time))}
        ${row('MODEL', escapeHtml(params.shipModel))}
        ${row('SERIAL', serial)}
      </div>
    </div>`;
}

export function renderTelemetry(root, params, callsign = '') {
  const el = document.createElement('div');
  el.className = 'telemetry';
  el.style.setProperty('--ship-color', params.color);
  el.innerHTML = telemetryHtml(params, callsign);

  const toggle = el.querySelector('.tm-toggle');
  toggle.addEventListener('click', () => {
    const collapsed = el.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.textContent = collapsed ? '▸' : '▾';
  });

  root.append(el);
  return el;
}
