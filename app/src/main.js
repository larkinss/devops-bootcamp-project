import { ship } from './config.js';
import { createScene } from './scene.js';
import { renderOverlay } from './overlay.js';
import { renderTelemetry } from './telemetry.js';
import { shouldUseFallback, detectWebGL, renderFallback } from './fallback.js';
import { resolveCallsign } from './callsign.js';
import { renderReady } from './ready.js';
import './style.css';

const app = document.getElementById('app');
document.title = `${ship.shipName} — Ship`;

const callsign = resolveCallsign();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gl = detectWebGL();

if (shouldUseFallback({ gl, reducedMotion })) {
  renderFallback(app, ship, callsign);
} else {
  const stage = document.createElement('div');
  stage.className = 'stage';
  app.append(stage);
  let overlay, telemetry;
  createScene(stage, ship, {
    onError() {
      stage.remove();
      overlay?.remove();
      telemetry?.remove();
      renderFallback(app, ship, callsign, 'Model failed to load — showing static view.');
    },
  });
  overlay = renderOverlay(app, ship, callsign);
  telemetry = renderTelemetry(app, ship, callsign);
}

renderReady(app, callsign);
