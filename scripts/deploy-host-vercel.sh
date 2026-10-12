#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOST_DIR="$ROOT_DIR/host"

DEPLOY_MODE="prod"
REMOTE_URL="${DESKTOP_UI_REMOTE_URL:-${REMOTE_URL:-}}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote-url)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --remote-url"
        exit 1
      fi
      REMOTE_URL="$2"
      shift 2
      ;;
    --preview)
      DEPLOY_MODE="preview"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--preview] [--remote-url https://desktop-ui.vercel.app]"
      exit 1
      ;;
  esac
done

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is required. Install with: npm i -g vercel"
  exit 1
fi

if [[ -z "${REMOTE_URL:-}" ]]; then
  echo "Missing remote URL."
  echo "Pass --remote-url <https://...> or set DESKTOP_UI_REMOTE_URL."
  exit 1
fi

REMOTE_URL="${REMOTE_URL%/}"

if [[ "$REMOTE_URL" == *"localhost"* ]] || [[ "$REMOTE_URL" == *"127.0.0.1"* ]]; then
  echo "REMOTE_URL must be a public URL, not localhost: $REMOTE_URL"
  exit 1
fi

echo "Deploying host with REMOTE_URL=$REMOTE_URL"

cd "$HOST_DIR"
if [[ "$DEPLOY_MODE" == "prod" ]]; then
  vercel deploy --prod --yes --build-env "REMOTE_URL=$REMOTE_URL"
else
  vercel deploy --yes --build-env "REMOTE_URL=$REMOTE_URL"
fi
