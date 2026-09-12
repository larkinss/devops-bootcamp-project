#!/usr/bin/env bash
# report.sh — POST one launch event to the Mission Control board.
#
# The learner workflow calls this with just two env values (CI/CD 3 Amali 2):
#   BOARD_URL     board address  (repository variable -> env)
#   SHIPIT_TOKEN  shared token   (repository secret   -> env)
# callsign comes from GITHUB_ACTOR (set by Actions automatically); color and
# shipModel come from ship.config.json. Stage/status are overridable for
# operator flourishes — report.sh [stage] [status] — default: liftoff shipped.
#
# siteUrl is derived here from the vars Actions already sets (GITHUB_REPOSITORY_
# OWNER + repo name -> https://<owner>.github.io[/<repo>]/), NOT from the taught
# env: block — the learner's two-line surface (BOARD_URL + SHIPIT_TOKEN) is
# pinned. The board probes that URL and only shows the ship LIVE (green) when the
# real Pages site answers 200 (issue #21). Omitted when run outside Actions.
#
# curl uses --fail-with-body on purpose: a rejected report (401) must FAIL the
# step (non-zero exit -> red run) while still printing {"error":"unauthorized"}
# in the run log, so the wrong-token demo shows both the red X and the reason.
# Plain -f would fail but swallow the response body — don't switch to it.
set -euo pipefail

: "${BOARD_URL:?BOARD_URL not set — register it as a repository variable}"
: "${SHIPIT_TOKEN:?SHIPIT_TOKEN not set — register it as a repository secret}"
: "${GITHUB_ACTOR:?GITHUB_ACTOR not set (GitHub Actions sets this automatically)}"

DIR="$(cd "$(dirname "$0")" && pwd)"
BODY="$(node -e '
  const fs = require("fs");
  const cfg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  // GitHub Pages URL from the repo Actions is running in. github.io hostnames are
  // lowercase (owner); the project-path segment keeps the repo name as-is. A user/
  // org site (repo == <owner>.github.io) lives at the domain root, no path.
  const repoFull = process.env.GITHUB_REPOSITORY || "";
  const owner = (process.env.GITHUB_REPOSITORY_OWNER || repoFull.split("/")[0] || "").toLowerCase();
  const repo = repoFull.split("/")[1] || "";
  let siteUrl;
  if (owner && repo) {
    siteUrl = repo.toLowerCase() === owner + ".github.io"
      ? "https://" + owner + ".github.io/"
      : "https://" + owner + ".github.io/" + repo + "/";
  }
  process.stdout.write(JSON.stringify({
    callsign: process.env.GITHUB_ACTOR,
    stage: process.argv[2],
    status: process.argv[3],
    color: cfg.color,
    shipModel: cfg.shipModel,
    siteUrl, // undefined outside Actions -> dropped by JSON.stringify
  }));
' "$DIR/../ship.config.json" "${1:-liftoff}" "${2:-shipped}")"

curl -sS --fail-with-body -X POST "$BOARD_URL/api/event" \
  -H "Authorization: Bearer $SHIPIT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BODY"
echo
