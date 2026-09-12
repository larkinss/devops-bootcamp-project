import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Build-time deploy facts, surfaced on the telemetry HUD. Computed here (not via
// pipeline env vars) so the answer-key workflows stay untouched and a local
// `npm run dev` still works.
function gitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

// base './' → relative asset URLs so the build works under any GitHub
// Pages subpath (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  define: {
    __BUILD_SHA__: JSON.stringify(gitShortSha()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
