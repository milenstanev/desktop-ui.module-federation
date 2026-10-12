#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANALYTICS_DIR="$ROOT_DIR/src/features/remotes/analytics"

DEPLOY_MODE="prod"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview)
      DEPLOY_MODE="preview"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--preview]"
      exit 1
      ;;
  esac
done

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is required. Install with: npm i -g vercel"
  exit 1
fi

cd "$ANALYTICS_DIR"
if [[ "$DEPLOY_MODE" == "prod" ]]; then
  vercel deploy --prod --yes
else
  vercel deploy --yes
fi
