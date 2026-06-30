#!/usr/bin/env bash
set -e

echo "── DRIFTER setup: scaffolding repo structure ──"

# ── ASSET FOLDERS (drop your SVGs/PNGs/audio here after this runs) ──
mkdir -p assets/characters/drifter/base
mkdir -p assets/characters/drifter/variants
mkdir -p assets/characters/drifter/portraits
mkdir -p assets/characters/husks/isometric/shambler
mkdir -p assets/characters/husks/isometric/sprinter
mkdir -p assets/characters/husks/isometric/bloated
mkdir -p assets/characters/husks/silhouettes

mkdir -p assets/tiles/ground
mkdir -p assets/tiles/road
mkdir -p assets/tiles/rubble

mkdir -p assets/buildings/templates
mkdir -p assets/buildings/generated_cache

mkdir -p assets/props
mkdir -p assets/items
mkdir -p assets/weapons

mkdir -p assets/ui/logbook
mkdir -p assets/ui/hud
mkdir -p assets/ui/fonts

mkdir -p assets/audio/music/ambient
mkdir -p assets/audio/music/tension
mkdir -p assets/audio/music/extraction
mkdir -p assets/audio/sfx/footsteps
mkdir -p assets/audio/sfx/ui
mkdir -p assets/audio/sfx/hazard
mkdir -p assets/audio/sfx/radio
mkdir -p assets/audio/voice

mkdir -p assets/fx/particles
mkdir -p assets/fx/noise

# ── SOURCE CODE FOLDER ──
mkdir -p src

# .gitkeep in every empty asset folder so git tracks the structure before you drop files in
find assets -type d -empty -exec touch {}/.gitkeep \;

echo "✓ Folder structure created."
echo ""
echo "Next: run setup-files.sh to write package.json, tsconfig.json, and src/*.ts"
echo "Then drag-and-drop your SVGs/PNGs/audio into the matching assets/ subfolders."
