# launchpad — your ship

A small personal **ship microsite**: a Three.js spaceship you customize, and the thing your
CI/CD pipeline builds, checks, and ships across the four sessions.

## Customize it

Edit **`ship.config.json`** — the only file you need to touch:

```json
{
  "shipName": "Nebula Runner",
  "color": "#22d3ee",
  "shipModel": "fighter",
  "emblem": "comet"
}
```

- `shipName` — up to 24 characters.
- `color` — a hex colour like `#22d3ee`, **or** a colour name (recolours your ship and its accent).
  Names: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`,
  `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `white`, `gray`/`grey`, `black`.
  (`white`/`gray`/`black` keep the ship's neutral factory paint.)
- `shipModel` — one of: `fighter`, `interceptor`, `hauler`, `scout`.
- `emblem` — one of: `comet`, `bolt`, `star`, `ring`, `delta`, `phoenix`.

Your **callsign** is your GitHub username — it's set automatically when the pipeline runs. On the
site, a **telemetry HUD** shows your ship class's spec readout plus this build's deploy facts
(callsign, commit, build time) — the pipeline made visible on your own ship.

## Run it

```bash
npm install
npm run dev        # live preview
npm test           # pre-flight check — fails (ABORT) if ship.config.json is invalid
npm run build      # static site → dist/
npm run preview    # serve the built site on :8080
```

`npm test` is the pre-flight gate: a bad `ship.config.json` exits non-zero and blocks the launch.
