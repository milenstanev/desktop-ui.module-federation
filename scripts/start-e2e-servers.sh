#!/usr/bin/env bash
set -euo pipefail

# Start main app and analytics remote for Playwright suites.
# Main app: port 3000. Analytics: port 3002 (built dist when present, else webpack-dev-server).

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANALYTICS_DIR="$ROOT_DIR/src/features/remotes/analytics"
cd "$ROOT_DIR"

cleanup() {
  trap - EXIT INT TERM
  if [[ -n "${MAIN_PID:-}" ]]; then
    kill "$MAIN_PID" 2>/dev/null || true
  fi
  if [[ -n "${ANALYTICS_PID:-}" ]]; then
    kill "$ANALYTICS_PID" 2>/dev/null || true
  fi
  wait "${MAIN_PID:-}" "${ANALYTICS_PID:-}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

if [[ ! -d build ]]; then
  echo "build/ not found. Running npm run build..."
  npm run build
fi

# Ensure analytics remote dependencies exist (CI runners only install root deps by default).
if [[ ! -x "$ANALYTICS_DIR/node_modules/.bin/webpack" ]]; then
  echo "analytics remote dependencies missing. Running npm ci in $ANALYTICS_DIR..."
  npm ci --prefix "$ANALYTICS_DIR" --no-audit --no-fund
fi

if [[ ! -f "$ANALYTICS_DIR/dist/remoteEntry.js" ]]; then
  echo "analytics dist/ missing. Building analytics remote..."
  npm run build --prefix "$ANALYTICS_DIR"
fi

npx serve -s build -l 3000 &
MAIN_PID=$!

# Serve the production remote (CORS required for Module Federation from :3000).
npx serve "$ANALYTICS_DIR/dist" -l 3002 --cors &
ANALYTICS_PID=$!

# Keep this launcher alive while both servers are healthy.
while kill -0 "$MAIN_PID" 2>/dev/null && kill -0 "$ANALYTICS_PID" 2>/dev/null; do
  sleep 1
done

# Force non-zero exit if either server dies unexpectedly.
exit 1
