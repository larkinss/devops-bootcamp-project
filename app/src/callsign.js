// Identity = the learner's GitHub username, derived from the Pages hostname at
// runtime: `user.github.io` (user + project pages both) -> `user`. No build var,
// no VITE_CALLSIGN in the taught workflow. Falls back to VITE_CALLSIGN then ''.
export function callsignFromHostname(hostname) {
  if (typeof hostname !== 'string') return '';
  const m = /^([a-z0-9-]+)\.github\.io$/.exec(hostname.toLowerCase());
  return m ? m[1] : '';
}

export function resolveCallsign() {
  return callsignFromHostname(window.location.hostname) || import.meta.env.VITE_CALLSIGN || '';
}
