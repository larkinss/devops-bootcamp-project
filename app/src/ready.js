// launchpad/src/ready.js
// The one bridge from the static site to the server: a link to the board cockpit,
// carrying the learner's callsign. Hidden unless we know both who they are and
// where the board is. BOARD_URL is a public build var — never a secret.
export function readyHref(boardUrl, callsign) {
  if (!boardUrl || !callsign) return null;
  return `${boardUrl.replace(/\/$/, '')}/play?callsign=${encodeURIComponent(callsign)}`;
}

export function renderReady(root, callsign) {
  const href = readyHref(import.meta.env.VITE_BOARD_URL, callsign);
  if (!href) return null;
  const a = document.createElement('a');
  a.className = 'ready';
  a.href = href;
  a.textContent = 'READY ▸ JOIN RACE';
  root.append(a);
  return a;
}
