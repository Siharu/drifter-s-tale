#!/usr/bin/env bash
# deploy-zip.sh  —  drop into your Codespace terminal
# Usage: bash deploy-zip.sh <path-to-zip>
# Example: bash deploy-zip.sh ~/uploads/drifter-s-tale-fixed.zip

set -euo pipefail

# ── 1. Arg check ──────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: bash deploy-zip.sh <path-to-zip>"
  exit 1
fi

ZIP="$(realpath "$1")"

if [[ ! -f "$ZIP" ]]; then
  echo "ERROR: file not found: $ZIP"
  exit 1
fi

# ── 2. Ensure rsync is available ─────────────────────────────────────────────
if ! command -v rsync &>/dev/null; then
  echo "→ rsync not found — installing …"
  sudo apt-get install -y rsync -qq
fi

# ── 3. Locate repo root ───────────────────────────────────────────────────────
find_repo_root() {
  local dir="$PWD"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]] && grep -q '"name".*"drifter"' "$dir/package.json" 2>/dev/null; then
      echo "$dir"; return
    fi
    dir="$(dirname "$dir")"
  done
  # fallback: search home for the folder
  find "$HOME" -maxdepth 5 -type d -name 'drifter-s-tale-main' 2>/dev/null | head -1
}

REPO_ROOT="$(find_repo_root)"

if [[ -z "$REPO_ROOT" ]]; then
  echo "ERROR: could not find repo root."
  echo "cd into drifter-s-tale-main first, then re-run."
  exit 1
fi

echo "→ Repo root : $REPO_ROOT"

# ── 4. Extract zip to temp dir ────────────────────────────────────────────────
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "→ Extracting $ZIP …"
unzip -q "$ZIP" -d "$TMP_DIR"

# Locate the inner folder that owns package.json (handles single-folder zips)
INNER="$(find "$TMP_DIR" -maxdepth 3 -name 'package.json' | head -1)"
INNER="$(dirname "$INNER")"

if [[ -z "$INNER" || ! -d "$INNER" ]]; then
  echo "ERROR: could not find package.json inside the zip."
  exit 1
fi

echo "→ Source     : $INNER"

# ── 5. Sync into repo (preserve node_modules and .git) ───────────────────────
echo "→ Syncing files …"
rsync -a --delete \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='.env' \
  "$INNER/" "$REPO_ROOT/"

echo "✓ Files synced."

# ── 6. Create any directories the engine expects ─────────────────────────────
DIRS_NEEDED=(
  "src/render"
  "src/gameplay"
  "src/ui"
  "src/data"
  "assets/tiles"
  "assets/sprites"
  "dist"
)

for d in "${DIRS_NEEDED[@]}"; do
  if [[ ! -d "$REPO_ROOT/$d" ]]; then
    mkdir -p "$REPO_ROOT/$d"
    echo "✓ Created $d"
  fi
done

# ── 7. Rebuild dist ───────────────────────────────────────────────────────────
echo ""
echo "→ Rebuilding dist/ …"
cd "$REPO_ROOT"
bash build-dist.sh

echo ""
echo "✓ All done. Run  bash deploy.sh  to push to Vercel."
