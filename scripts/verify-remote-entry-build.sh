#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
MANIFEST="$BUILD_DIR/asset-manifest.json"
REMOTE_ENTRY="$BUILD_DIR/remoteEntry.js"

if [[ ! -f "$REMOTE_ENTRY" ]]; then
  echo "ERROR: missing build/remoteEntry.js"
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "ERROR: missing build/asset-manifest.json"
  exit 1
fi

if ! grep -q '"desktopUI.js": "/remoteEntry.js"' "$MANIFEST"; then
  echo "ERROR: asset-manifest.json does not include desktopUI remote entry"
  exit 1
fi

echo "Verified Module Federation artifact: build/remoteEntry.js"
