#!/usr/bin/env bash
# Starts the lab as a Labspace whose terminal runs on this machine:
#   - the bridge (bridge/server.js) on http://localhost:8085, natively, with your shell
#   - the Labspace interface in a container on http://localhost:3030
# Ctrl-C stops both.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
export BRIDGE_PORT="${BRIDGE_PORT:-8085}"
# A fresh token for each run: the interface needs it to send commands to the bridge.
LABSPACE_TOKEN="$(node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))')"
export LABSPACE_TOKEN

command -v node >/dev/null || { echo "Node.js 20+ is required for the bridge." >&2; exit 1; }
command -v docker >/dev/null || { echo "Docker is required for the Labspace interface." >&2; exit 1; }

if [ ! -d "$here/bridge/node_modules" ]; then
  echo "Installing the bridge dependencies..."
  (cd "$here/bridge" && npm install --no-audit --no-fund --loglevel=error)
fi
# node-pty ships macOS and Windows binaries; its install script, which recent npm versions may skip,
# is what makes the macOS helper executable.
chmod +x "$here"/bridge/node_modules/node-pty/prebuilds/darwin-*/spawn-helper 2>/dev/null || true

cleanup() {
  trap - EXIT INT TERM
  echo
  echo "Stopping..."
  docker compose -f "$here/compose.yaml" down --remove-orphans >/dev/null 2>&1 || true
  [ -n "${bridge_pid:-}" ] && kill "$bridge_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

node "$here/bridge/server.js" &
bridge_pid=$!

docker compose -f "$here/compose.yaml" up -d --pull missing --wait

url="http://localhost:3030"
echo
echo "Labspace ready: $url"
echo "The right panel is a terminal on this machine. Ctrl-C to stop."
if [ -n "${LABSPACE_NO_OPEN:-}" ]; then :
elif command -v open >/dev/null; then open "$url"; elif command -v xdg-open >/dev/null; then xdg-open "$url" >/dev/null 2>&1; fi

wait "$bridge_pid"
